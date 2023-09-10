package com.ssafy.catchpalm.db.entity;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

@Entity(name = "GAME_ROOM_USERINFO")
@Getter
@Setter
public class GameRoomUserInfo {
    @Id @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "userinfo_number")
    private int userInfoNumber; // 유저정보 넘버 : PK

    @OneToOne
    @JoinColumn(name = "user_number", nullable = false, unique = true)
    private User user; // 게임방 유저 정보

    @ManyToOne(fetch = FetchType.LAZY)// 단방향 매핑
    @JoinColumn(name = "room_number", nullable = false)
    private GameRoom gameRoom; // 게임방 정보

    private int score; // 해당점수

    private int team; // 팀 정보

    private int ready; // 레디정보.

}
