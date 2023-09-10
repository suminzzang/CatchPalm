package com.ssafy.catchpalm.db.repository;

import com.ssafy.catchpalm.db.entity.GameRoom;
import com.ssafy.catchpalm.db.entity.GameRoomUserInfo;
import com.ssafy.catchpalm.db.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 게임 방 관련 디비 쿼리 생성을 위한 JPA Query Method 인터페이스 정의.
 */
@Repository
public interface GameRoomUserInfoRepository extends JpaRepository<GameRoomUserInfo, Integer> {
    // 사용자 고유 넘버를 기준(유니크값)으로 게임룸 유저정보 테이블에서 조회.
    GameRoomUserInfo findByUserUserNumber(Long userNumber);
    // userNumber 값으로 GameRoomUserInfo 엔티티 삭제
    void deleteByUserUserNumber(Long userNumber);
    int countByGameRoomRoomNumber(int roomNumber);
    List<GameRoomUserInfo> findByGameRoomRoomNumber(int roomNumber);

    // 해당 게임룸의 유저들 정보 반환. 레디 정보가 0이아닌 유저들만.
    List<GameRoomUserInfo> findByGameRoomRoomNumberAndReadyNot(int roomNumber, int readyValue);
}