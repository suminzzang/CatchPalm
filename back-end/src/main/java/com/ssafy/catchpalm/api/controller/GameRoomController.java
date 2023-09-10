package com.ssafy.catchpalm.api.controller;

import com.ssafy.catchpalm.api.request.*;
import com.ssafy.catchpalm.api.response.GameRoomPostRes;
import com.ssafy.catchpalm.api.response.UserRes;
import com.ssafy.catchpalm.api.service.GameRoomService;
import com.ssafy.catchpalm.api.service.UserService;
import com.ssafy.catchpalm.common.auth.SsafyUserDetails;
import com.ssafy.catchpalm.common.model.response.BaseResponseBody;
import com.ssafy.catchpalm.db.entity.GameRoom;
import com.ssafy.catchpalm.db.entity.GameRoomUserInfo;
import com.ssafy.catchpalm.db.entity.User;
import com.ssafy.catchpalm.websocket.chat.model.UserReady;
import io.swagger.annotations.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import springfox.documentation.annotations.ApiIgnore;

import java.util.List;
import java.util.Map;

/**
 * 게임방 관련 API 요청 처리를 위한 컨트롤러 정의.
 */
@Api(value = "게임룸 API", tags = {"GameRoom"})
@RestController
@RequestMapping("/api/v1/gameRooms")
public class GameRoomController {

	@Autowired
	GameRoomService gameRoomService;

	@PostMapping("/create")
	@ApiOperation(value = "게임방 생성", notes = "<strong>방장유저번호, 방제, 정원, 비밀번호(선택), 카테고리</strong>를 통해 방 생성.")
    @ApiResponses({
        @ApiResponse(code = 200, message = "성공"),
        @ApiResponse(code = 401, message = "인증 실패"),
        @ApiResponse(code = 404, message = "사용자 없음"),
        @ApiResponse(code = 500, message = "서버 오류")
    })
	public ResponseEntity<GameRoomPostRes> createRoom(
			@RequestBody @ApiParam(value="방 정보", required = true) GameRoomRegisterPostReq gameRoomInfo) {

		GameRoom gameRoom = gameRoomService.createRoom(gameRoomInfo);
		return ResponseEntity.status(200).body(GameRoomPostRes.of(gameRoom, null));
	}

	@DeleteMapping("/delete/{roomNumber}")
	@ApiOperation(value = "게임방 삭제", notes = "<strong>게임방 번호</strong>를 통해 방 삭제. ")
	@ApiResponses({
			@ApiResponse(code = 200, message = "성공"),
			@ApiResponse(code = 401, message = "인증 실패"),
			@ApiResponse(code = 404, message = "사용자 없음"),
			@ApiResponse(code = 500, message = "서버 오류")
	})
	public ResponseEntity<? extends BaseResponseBody> deleteRoom(
			@ApiParam(value="방 정보", required = true)@PathVariable("roomNumber") int roomNumber) {

		gameRoomService.deleteRoom(roomNumber);
		return ResponseEntity.status(200).body(BaseResponseBody.of(200, "Success"));
	}

	@PostMapping("/addUser")
	@ApiOperation(value = "게임방유저 추가", notes = "<strong>유저넘버, 게임방넘버</strong>를 통해 게임방유저테이블에 추가. ")
	@ApiResponses({
			@ApiResponse(code = 200, message = "성공"),
			@ApiResponse(code = 401, message = "인증 실패"),
			@ApiResponse(code = 404, message = "사용자 없음"),
			@ApiResponse(code = 500, message = "서버 오류")
	})
	public ResponseEntity<? extends BaseResponseBody> addUser(
			@ApiParam(value="'userNumber' : 번호, 'roomNumber' : 번호", required = true)@RequestBody AddGameRoomUserReq addGameRoomUserReq) {
		GameRoomUserInfo userInfos = gameRoomService.addRoomUser(addGameRoomUserReq.getUserNumber(), addGameRoomUserReq.getGameRoomNumber());

		if(userInfos != null){
			return ResponseEntity.status(200).body(BaseResponseBody.of(200, "입장성공"));
		}
		return ResponseEntity.status(200).body(BaseResponseBody.of(200, "입장실패: 정원이 꽉 찼거나 없어진 방입니다."));
	}


	@DeleteMapping("/outUser")
	@ApiOperation(value = "게임방유저 나감(강퇴)", notes = "<strong>유저넘버</strong>를 통해 게임방유저테이블에서 강퇴. ")
	@ApiResponses({
			@ApiResponse(code = 200, message = "성공"),
			@ApiResponse(code = 401, message = "인증 실패"),
			@ApiResponse(code = 404, message = "사용자 없음"),
			@ApiResponse(code = 500, message = "서버 오류")
	})
	public ResponseEntity<? extends BaseResponseBody> outUser(
			@ApiParam(value="'userNumber' : 번호, 'roomNumber' : 번호", required = true)

			@RequestBody AddGameRoomUserReq addGameRoomUserReq) {
		System.out.println("out");
		gameRoomService.outRoomUser(addGameRoomUserReq.getUserNumber(), addGameRoomUserReq.getGameRoomNumber());
		return ResponseEntity.status(200).body(BaseResponseBody.of(200, "Success"));
	}


	@GetMapping("/listRooms")
	@ApiOperation(value = "게임방 리스트 반환", notes = "<strong>게임방리스트반환</strong>")
	@ApiResponses({
			@ApiResponse(code = 200, message = "성공"),
			@ApiResponse(code = 401, message = "인증 실패"),
			@ApiResponse(code = 404, message = "사용자 없음"),
			@ApiResponse(code = 500, message = "서버 오류")
	})
	public ResponseEntity<?> listRoom() {
		return ResponseEntity.status(200).body(gameRoomService.gameRoomList());
	}


	//게임방 시작시 게임방 상태정보 및 최종 실행 음악 정보 업데이트
	@PutMapping("/updateRoomStart")
	@ApiOperation(value = "게임 시작시 해당 방 상태 및 실행 음악 업데이트", notes = "<strong>게임방 번호, 음악 넘버</strong> 입력받아 해당 데이터로 업데이트")
	@ApiResponses({
			@ApiResponse(code = 200, message = "성공"),
			@ApiResponse(code = 401, message = "인증 실패"),
			@ApiResponse(code = 404, message = "사용자 없음"),
			@ApiResponse(code = 500, message = "서버 오류")
	})
	public ResponseEntity<?> gameStart(
			@ApiParam(value="'musicNumber' : 번호, 'roomNumber' : 번호", required = true)@RequestBody GameStartReq gameStartReq) {
		gameRoomService.startGame(gameStartReq.getMusicNumber(), gameStartReq.getGameRoomNumber());
		return ResponseEntity.status(200).body(BaseResponseBody.of(200, "Success"));
	}

	// 게임방 정보 가져오기: 입장 시 + 음악정보들 같이 가져오기.
	@GetMapping("/getGameRoomInfo/{roomNumber}")
	@ApiOperation(value = "게임방 상세정보 가져오기", notes = "<strong>게임방 번호</strong> 입력받아 해당 데이터로 방정보 조회")
	@ApiResponses({
			@ApiResponse(code = 200, message = "성공"),
			@ApiResponse(code = 401, message = "인증 실패"),
			@ApiResponse(code = 404, message = "사용자 없음"),
			@ApiResponse(code = 500, message = "서버 오류")
	})
	public ResponseEntity<?> getRoomInfo(
			@ApiParam(value="방 정보", required = true)@PathVariable("roomNumber") int roomNumber) {
		GameRoomPostRes resultRoom = gameRoomService.getRoomInfo(roomNumber);
		return ResponseEntity.status(200).body(resultRoom);

	}

	// 게임방 입장 조건 검증
	@PostMapping("/authentication")
	@ApiOperation(value = "게임방 입장 조건 검증", notes = "<strong>게임방 번호, 비밀번호</strong> 입력받아 해당 데이터로 입장 검증")
	@ApiResponses({
			@ApiResponse(code = 200, message = "성공"),
			@ApiResponse(code = 401, message = "인증 실패"),
			@ApiResponse(code = 404, message = "사용자 없음"),
			@ApiResponse(code = 500, message = "서버 오류")
	})
	public ResponseEntity<BaseResponseBody> authentication(
			@ApiParam(value="'roomNumber' : 방번호, '' : 번호", required = true)@RequestBody AuthenticationRoomReq gameStartReq) {
		String result = gameRoomService.check(gameStartReq);
		return ResponseEntity.status(200).body(BaseResponseBody.of(200, result));
	}

	// 레디 전환 테스트.
	@PostMapping("/ready")
	@ApiOperation(value = "게임방 레디 상태 변환", notes = "<strong>게임방 번호, 유저번호, 현재레디상태</strong> 입력받아 해당 데이터로 레디상태 변화")
	@ApiResponses({
			@ApiResponse(code = 200, message = "성공"),
			@ApiResponse(code = 401, message = "인증 실패"),
			@ApiResponse(code = 404, message = "사용자 없음"),
			@ApiResponse(code = 500, message = "서버 오류")
	})
	public ResponseEntity<?> changeReady(
			@ApiParam(value="'roomNumber' : 방번호, 'userNumber' : 유저번호, 'isReady' : 0", required = true)@RequestBody UserReady userReady) {
		return ResponseEntity.status(200).body(gameRoomService.readyStatus(userReady));
	}

	// 게임방 상태 대기중으로 변경.
	@GetMapping("/inGameToWaiting/{roomNumber}")
	@ApiOperation(value = "게임방 상태 대기중으로 변환: 게임중->대기중", notes = "<strong>게임방 번호</strong> 입력받아 해당 데이터로 게임방 상태 대기중으로 변환.")
	@ApiResponses({
			@ApiResponse(code = 200, message = "성공"),
			@ApiResponse(code = 401, message = "인증 실패"),
			@ApiResponse(code = 401, message = "인증 실패"),
			@ApiResponse(code = 404, message = "사용자 없음"),
			@ApiResponse(code = 500, message = "서버 오류")
	})
	public ResponseEntity<?> updateGameRoomStatusToZero(
			@ApiParam(value="방번호", required = true) @PathVariable("roomNumber") int roomNumber) {
		return ResponseEntity.status(200).body(gameRoomService.updateGameRoomStatusToZero(roomNumber));
	}

	// 게임 도중 나간 유저에 대한 처리.
	@PostMapping("/escapeGame")
	@ApiOperation(value = "게임 도중 나가버린 유저 처리", notes = "<strong>게임방 번호, 유저번호, 현재레디상태</strong> 입력받아 해당 데이터로 레디상태 변화")
	@ApiResponses({
			@ApiResponse(code = 200, message = "성공"),
			@ApiResponse(code = 401, message = "인증 실패"),
			@ApiResponse(code = 404, message = "사용자 없음"),
			@ApiResponse(code = 500, message = "서버 오류")
	})
	public ResponseEntity<? extends BaseResponseBody> escapeRoom(
			@ApiParam(value="'roomNumber' : 방번호, 'playCnt' : 방 내에서 게임회차, 'userNumber' : 유저번호", required = true)@RequestBody EscapeRoom escapeRoom) {
		gameRoomService.checkLeftUser(escapeRoom.getRoomNumber(), escapeRoom.getPlayCnt(), escapeRoom.getUserNumber());
		System.out.println("is hear?? escapeRoom");
		return ResponseEntity.status(200).body(BaseResponseBody.of(200, "Success"));
	}
}
