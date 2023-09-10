package com.ssafy.catchpalm.api.service;

import com.ssafy.catchpalm.api.request.AuthenticationRoomReq;
import com.ssafy.catchpalm.api.request.GameRoomRegisterPostReq;
import com.ssafy.catchpalm.api.response.GameRoomPostRes;
import com.ssafy.catchpalm.db.entity.GameRoom;
import com.ssafy.catchpalm.db.entity.GameRoomUserInfo;
import com.ssafy.catchpalm.websocket.chat.model.ReadyInfo;
import com.ssafy.catchpalm.websocket.chat.model.UserInfo;
import com.ssafy.catchpalm.websocket.chat.model.UserReady;

import javax.transaction.Transactional;
import java.util.List;

/**
 *	유저 관련 비즈니스 로직 처리를 위한 서비스 인터페이스 정의.
 */
public interface GameRoomService {
	GameRoom createRoom(GameRoomRegisterPostReq gameRoomRegisterPostReq);
	void deleteRoom(int roomNumber);
	GameRoomUserInfo addRoomUser(Long userNumber, int roomNumber);

    String outRoomUser(Long userNumber, int gameRoomNumber);

    List<GameRoomPostRes> gameRoomList();

    void startGame(int musicNumber, int gameRoomNumber);

    GameRoomPostRes getRoomInfo(int roomNumber);

    List<UserInfo> getRoomUsers(int roomNumber);
    String check(AuthenticationRoomReq gameStartReq);

    // 게임룸에 있는 유저 레디 상태 변화 반영 -> 현재 게임방 내의 유저들 레디상태 리턴.
    UserReady readyStatus(UserReady userReady);

    // 음악 변경 업데이트.
    void musicChange(int gameRoomNumber, int musicNumber);

    // 게임방 생태 받아오기
    int getStatusByRoomNumber(int roomNumber);

    // 게임방 상태 대기중으로 변경
    int updateGameRoomStatusToZero(int roomNumber);

    //게임 끝난 후 게임방으로 돌아올때 해당 유저가 기존 유저인지 확인.
    boolean isUserNumberMatching(Long userNumber, int gameRoomNumber);

    // 게임룸에 있는 유저정보 반환: 레디가 0이 아닌 유저만.
    @Transactional
    void resetReadyStatusForGameRoom(int roomNumber);

    @Transactional
    void checkLeftUser(int roomNumber, int platCnt, Long userNumber);
}
