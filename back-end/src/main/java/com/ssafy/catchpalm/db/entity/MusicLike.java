package com.ssafy.catchpalm.db.entity;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

@Entity
@Getter
@Setter
public class MusicLike {
    @Id @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "like_number")
    private int likeNumber; // 음악 좋아요 넘버 : PK

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_number")
    private User userLike; // 좋아요 누른 유저 정보 : 단방향 매핑

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "music_number")
    private Music music; // 좋아요 눌린 음악 정보 : 단방향 매핑

}
