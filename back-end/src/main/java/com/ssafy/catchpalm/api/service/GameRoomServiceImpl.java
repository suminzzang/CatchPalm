package com.ssafy.catchpalm.api.service;

import com.ssafy.catchpalm.api.request.AuthenticationRoomReq;
import com.ssafy.catchpalm.api.request.GameRoomRegisterPostReq;
import com.ssafy.catchpalm.api.response.GameRoomPostRes;
import com.ssafy.catchpalm.api.response.MusicPostRes;
import com.ssafy.catchpalm.db.dto.RecordsDTO;
import com.ssafy.catchpalm.db.entity.*;
import com.ssafy.catchpalm.db.repository.GameRoomRepository;
import com.ssafy.catchpalm.db.repository.GameRoomUserInfoRepository;
import com.ssafy.catchpalm.db.repository.MusicRepository;
import com.ssafy.catchpalm.db.repository.UserRepository;
import com.ssafy.catchpalm.websocket.chat.model.UserInfo;
import com.ssafy.catchpalm.websocket.chat.model.UserReady;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

/**
 *	유저 관련 비즈니스 로직 처리를 위한 서비스 구현 정의.
 */
@Service("gameRoomService")
public class GameRoomServiceImpl implements GameRoomService {
	@Autowired
	GameRoomRepository gameRoomRepository;

	@Autowired
	GameRoomUserInfoRepository gameRoomUserInfoRepository;

	@Autowired
	UserRepository userRepository;

	@Autowired
	MusicRepository musicRepository;

	@Autowired
	GameService gameService;

	@Override
	public GameRoom createRoom(GameRoomRegisterPostReq gameRoomRegisterPostReq) {
		GameRoom gameRoom = new GameRoom();
		User user = new User();
		gameRoom.setCaptain(user);
		user.setUserNumber(gameRoomRegisterPostReq.getUserNumber());// 게임방 언터티에 방장정보 저장.

		gameRoom.setTitle(gameRoomRegisterPostReq.getTitle()); // 입력받은 방제목 저장.
		gameRoom.setCapacity(gameRoomRegisterPostReq.getCapacity()); // 입력받은 정원 수 저장.
		// 입력받은 비밀번호가 있다면 저장.
		if(gameRoomRegisterPostReq.getPassword() != null){
			gameRoom.setPassword(gameRoomRegisterPostReq.getPassword());
		}

		//게임모드이기에 카테고리넘버: 0 = 개인전 | 1 = 팀전
		Category category = new Category();
		gameRoom.setCategory(category);
		category.setCategoryNumber(gameRoomRegisterPostReq.getCategoryNumber());

		//게임방 디폴트 음악정보 저장: music_number:1
		Music music = new Music();
		gameRoom.setMusic(music);
		music.setMusicNumber(1);

		//생성 직후 대기방 상태 저장. 0: 대기중, 1: 게임중
		gameRoom.setStatus(0);

		// 게임룸 저장
		GameRoom resultGameRoom = gameRoomRepository.save(gameRoom);

		return resultGameRoom;
	}

	@Override
	public void deleteRoom(int roomNumber) {
		GameRoom gameRoom = gameRoomRepository.findById(roomNumber).orElse(null);

		if (gameRoom != null) {
			// GameRoom과 연관된 GameRoomUserInfo들을 찾습니다.
			List<GameRoomUserInfo> gameRoomUserInfos = gameRoom.getUserInfos();
			// GameRoom과 연관된 GameRoomUserInfo들을 삭제합니다.
			gameRoomUserInfoRepository.deleteAll(gameRoomUserInfos);
			// GameRoom을 삭제합니다.
			gameRoomRepository.delete(gameRoom);
		}
	}

	@Override
	@Transactional
	public GameRoomUserInfo addRoomUser(Long userNumber, int roomNumber) {
		// 해당 게임룸에 대한 정보 조회: 정원 확인 및 게임방 존재 유무 확인
		GameRoom gameRoom = gameRoomRepository.findById(roomNumber).orElse(null);
		// 게임방이 존재한다면
		if(gameRoom != null){
			int cntUsers = gameRoom.getUserInfos().size();
			if(cntUsers<gameRoom.getCapacity()){
				User user = new User();
				GameRoomUserInfo userInfo = new GameRoomUserInfo();

				userInfo.setUser(user);
				user.setUserNumber(userNumber);

				userInfo.setGameRoom(gameRoom);
				// 들어갈 수 있으면
				return gameRoomUserInfoRepository.save(userInfo);
			}
			//인원이 꽉 찼다면
			else return null;
		}
		// 존재하지 않다면
		else return null;
	}

	@Override
	@Transactional
	public String outRoomUser(Long userNumber, int gameRoomNumber) {
		gameRoomUserInfoRepository.deleteByUserUserNumber(userNumber);// 게임방 유저 나감 처리.
		int cnt = gameRoomUserInfoRepository.countByGameRoomRoomNumber(gameRoomNumber); // 나간 후 인원체크
		if(cnt == 0){ // 아무도 없는 방이 된다면 방 삭제.
			deleteRoom(gameRoomNumber);
			return null;
		}
		// 만약 방장이 게임방을 나갔고, 게임방 내에 유저가 남아 있을 때.
		// 나간 사람이 방장인지 확인.
		GameRoom gameRoom = gameRoomRepository.findById(gameRoomNumber).orElse(null);// 게임방 정보 불러오는 메서드 실행.
		if(userNumber == gameRoom.getCaptain().getUserNumber()){ // 만약 삭제될 유저번호가 현재 게임방 방장 유저번호와 같다면.: 방장 양도 조건.
			List<GameRoomUserInfo> userInfos = gameRoom.getUserInfos(); // 해당 방의 모든 유저 정보를 불러온다.

			for(GameRoomUserInfo userInfo : userInfos){ // 반복문을 돌려서 게임방 내의 모든 유저정보 조회.
				Long newCaptainNum = userInfo.getUser().getUserNumber(); // 새로이 방장이 될 유저의 번호

				if(newCaptainNum != userNumber){ // 만약 현재 나가려는 방장 유저번호와 새로이 방장이 될 유저의 번호가 다르다면
					User newCaptain = userRepository.findById(newCaptainNum).orElse(null); // 업데이트할 정보 정의.

					if (newCaptain != null) { // 실제 존재하는 유저이다면
						gameRoom.setCaptain(newCaptain);  // 새로운 방장 정보에 업데이트.
						gameRoomRepository.save(gameRoom); // 업데이트 실행.
						return gameRoom.getCaptain().getNickname(); // 방장이 변경되면 해당 방장 닉네임만 리턴.
					}
				}
			}
		}
		return null;
	}

	@Override
	public List<GameRoomPostRes> gameRoomList() {
		// 모든 GameRoom 엔티티 조회
		List<GameRoom> gameRooms = gameRoomRepository.findAll();
		List<GameRoomPostRes> gameRoomPostRes = new ArrayList<>();

		for(GameRoom gameRoom : gameRooms){
			gameRoomPostRes.add(GameRoomPostRes.of(gameRoom,null));
		}

		return gameRoomPostRes;
	}

	@Override
	@Transactional
	public void startGame(int musicNumber, int gameRoomNumber) {
		// 엔티티 조회: 게임방 정보 가져오기.( 유무도 확인)
		Optional<GameRoom> optionalGameRoom = gameRoomRepository.findById(gameRoomNumber);
		Music music = new Music();
		if(optionalGameRoom.isPresent()){
			GameRoom gameRoom = optionalGameRoom.get();
			gameRoom.setStatus(1);
			gameRoom.setMusic(music);
			gameRoom.setPlayCnt(gameRoom.getPlayCnt()+1);
			music.setMusicNumber(musicNumber);
			music.setPlayCnt(music.getPlayCnt()+1);
			gameRoomRepository.save(gameRoom);
		}
	}

	@Override
	public GameRoomPostRes getRoomInfo(int roomNumber) {
		// 해당 게임룸에 대한 정보 조회: 정원 확인 및 게임방 존재 유무 확인
		GameRoom gameRoom = gameRoomRepository.findById(roomNumber).orElse(null);
		// 존재하는 게임방일 때.
		if (gameRoom != null) {
			// 모든 GameRoom 엔티티 조회
			List<Music> musics = musicRepository.findAll();
			List<MusicPostRes> resMusics = new ArrayList<>();
			for(Music music : musics){
				resMusics.add(MusicPostRes.of(music));
			}
			GameRoomPostRes resultGameRoom = GameRoomPostRes.of(gameRoom, resMusics);
			return resultGameRoom;
		}
		return null;
	}

	// 게임룸에 있는 유저 정보 조회.
	@Override
	public List<UserInfo> getRoomUsers(int roomNumber) {
		List<GameRoomUserInfo> userInfos = gameRoomUserInfoRepository.findByGameRoomRoomNumber(roomNumber);

		List<UserInfo> resultUserInfos = new ArrayList<>();

		for(GameRoomUserInfo userInfo : userInfos){
			UserInfo resultUserInfo = new UserInfo();
			resultUserInfo.setNickname(userInfo.getUser().getNickname());

			String proImg = "";
			try {
				if (userInfo.getUser().getProfileImg() != null) {
					InputStream inputStream = userInfo.getUser().getProfileImg().getBinaryStream();
					byte[] bytes = new byte[(int) userInfo.getUser().getProfileImg().length()];
					inputStream.read(bytes);
					inputStream.close();

					proImg = Base64.getEncoder().encodeToString(bytes);
					resultUserInfo.setProfileImg(proImg);
				}
			} catch (Exception e) {
				e.printStackTrace();
			}
			resultUserInfo.setUserNumber(userInfo.getUser().getUserNumber());
			resultUserInfo.setReady(userInfo.getReady());

			resultUserInfos.add(resultUserInfo);
		}
		return resultUserInfos;
	}

	@Override
	@Transactional
	public String check(AuthenticationRoomReq gameStartReq) {
		// 해당 게임룸에 대한 정보 조회: 정원 확인 및 게임방 존재 유무 확인
		GameRoom gameRoom = gameRoomRepository.findById(gameStartReq.getRoomNumber()).orElse(null);
		// 게임방이 존재한다면
		if(gameRoom != null) {
			// 게임방의 상태가 대기중인 방일 때.
			if (gameRoom.getStatus() == 0) {

				int cntUsers = gameRoom.getUserInfos().size(); // 해당 게임방에 참여중인 유저 수.
				// 게임방 유저 수가 정원보다 작다면.
				if (cntUsers < gameRoom.getCapacity()) {
					// 위의 조건을 만족하며 만약 비밀번호가 없는 방이라면 방 입장 성공.
					if (gameStartReq.getPassword().equals("")) {
						return "입장성공";
					}
					// 비밀번호가 걸려 있으며 입력한 비밀번호가 일치한다면 방 입장 성공.
					else if (gameStartReq.getPassword().equals(gameRoom.getPassword())) {
						return "입장성공";
					}
					// 비밀번호가 틀림.
					return "비밀번호가 틀렸습니다.";
				}
				// 게임방 자리가 꽉찼다.
				return "인원이 꽉 찬 방입니다.";
			}
			// 이미 시작한 게임방 -> 입장하려는 직전에 시작한 게임방일 경우.
			return "이미 게임중인 방입니다.";
		}
		//존재하지 않는 게임방. -> 입장하려는 직전에 삭제된 게임방일 경우.
		return "이미 사라진 방입니다.";
	}

	// 게임룸에 있는 유저 레디 상태 변화 반영 -> 현재 게임방 내의 유저들 레디상태 리턴.
	@Override
	public UserReady readyStatus(UserReady userReady) {
		// 게임방 번호
		int roomNumber = userReady.getRoomNumber();
		// 입력받은 유저 번호와 일치하는 게임방 유저정보 조회.
		GameRoomUserInfo resultUserInfo = gameRoomUserInfoRepository.findByUserUserNumber(userReady.getUserNumber());
		// 레디상태 변환: 0이면 1, 1이면 0 | 0:레디x, 1:레디o
		resultUserInfo.setReady(resultUserInfo.getReady() == 0 ? 1:0);
		// 레디상태가 변환 게임방 유저정보 수정.
		resultUserInfo = gameRoomUserInfoRepository.save(resultUserInfo);

		UserReady resultUserReady = new UserReady();
		resultUserReady.setIsReady(resultUserInfo.getReady());
		resultUserReady.setRoomNumber(resultUserInfo.getGameRoom().getRoomNumber());
		resultUserReady.setUserNumber(resultUserInfo.getUser().getUserNumber());

		return resultUserReady;
	}
	// 음악 변경 업데이트.
	@Override
	public void musicChange(int gameRoomNumber, int musicNumber) {
		// 엔티티 조회: 게임방 정보 가져오기.( 유무도 확인)
		Optional<GameRoom> optionalGameRoom = gameRoomRepository.findById(gameRoomNumber);
		Music music = new Music();
		if(optionalGameRoom.isPresent()){
			GameRoom gameRoom = optionalGameRoom.get();
			gameRoom.setMusic(music);
			music.setMusicNumber(musicNumber);

			gameRoomRepository.save(gameRoom);
		}
	}

	// 게임방 생태 받아오기
	@Override
	public int getStatusByRoomNumber(int roomNumber) {
		GameRoom gameRoom = gameRoomRepository.findByRoomNumber(roomNumber);
		if (gameRoom != null) {
			return gameRoom.getStatus();
		}
		return -1; // 해당 roomNumber에 해당하는 게임방이 없을 경우 처리
	}

	// 게임방 상태 대기중으로 변경
	@Override
	public int updateGameRoomStatusToZero(int roomNumber) {
		GameRoom gameRoom = gameRoomRepository.findByRoomNumber(roomNumber);
		if (gameRoom != null) {
			gameRoom.setStatus(0); // status를 0으로 변경
			gameRoomRepository.save(gameRoom); // 변경된 정보 저장
			resetReadyStatusForGameRoom(roomNumber); // 레디정보 초기화.
			return 1;
		} else {
			// 해당 roomNumber에 해당하는 게임방이 없을 경우 처리
			return  2;
		}
	}

	//게임 끝난 후 게임방으로 돌아올때 해당 유저가 기존 유저인지 확인.
	@Override
	public boolean isUserNumberMatching(Long userNumber, int gameRoomNumber) {
		GameRoomUserInfo userInfo = gameRoomUserInfoRepository.findByUserUserNumber(userNumber);
		if (userInfo != null && userInfo.getGameRoom().getRoomNumber() == gameRoomNumber) {
			return true;
		}
		return false; // 해당 userInfoNumber에 해당하는 정보가 없을 경우 처리
	}

	// 게임룸에 있는 유저정보 반환: 레디가 0이 아닌 유저만.
	@Transactional
	@Override
	public void resetReadyStatusForGameRoom(int roomNumber) {
		List<GameRoomUserInfo> userInfoList = gameRoomUserInfoRepository.findByGameRoomRoomNumberAndReadyNot(roomNumber, 0);

		for (GameRoomUserInfo userInfo : userInfoList) {
			userInfo.setReady(0);
		}

		// 업데이트된 엔티티를 데이터베이스에 저장합니다.
		gameRoomUserInfoRepository.saveAll(userInfoList);
	}

	@Override
	@Transactional
	public void checkLeftUser(int roomNumber, int platCnt, Long userNumber) {
		// 게임 결과가 기록된 명단.
		List<RecordsDTO> records = gameService.getRecords(roomNumber, platCnt);

		for(RecordsDTO record : records){
			if(record.getUserDTO().getUserNumber() == userNumber) return;
		}

		outRoomUser(userNumber, roomNumber);
	}
}
