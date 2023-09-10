package com.ssafy.catchpalm.db.entity;

//import jdk.Exported;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity(name = "GAME_ROOM")
@Getter
@Setter
public class GameRoom {
    @Id @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "room_number")
    private int roomNumber;

    @OneToOne
    @JoinColumn(name = "captain", unique = true)
    private User captain;

    // 양방향 매핑 : 게임방 유저 리스트., 지연로딩, 영속성 관리를 통해 방 생성자 정보가 자동으로 게임방유저 테이블에 저장
    @OneToMany(mappedBy = "gameRoom", fetch = FetchType.LAZY)
    private List<GameRoomUserInfo> userInfos = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY) // 단방향 매핑 : 카테고리 정보, 지연로딩
    @JoinColumn(name = "category_number", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY) // 단방향 매핑 : 게임방 플레이 뮤직 정보, 즉시로딩
    @JoinColumn(name = "music_number")
    private Music music;

    @Column(nullable = false)
    private int capacity; // 게임방 정원

    private String password; // 게임방 비밀번호

    @Column(nullable = false)
    private String title; // 게임방 제목
    @Column(nullable = false)
    private int status; // 게임방 상태 : 0 = wait, 1 = gaming
    @Column(name="play_cnt")
    private int playCnt=1; // 방에서 게임 홧수

    //연관관계 편의 메서드 : 방 유저 추가
    public void addUser(GameRoomUserInfo userInfo){
        userInfos.add(userInfo);
        userInfo.setGameRoom(this);
    }


}
