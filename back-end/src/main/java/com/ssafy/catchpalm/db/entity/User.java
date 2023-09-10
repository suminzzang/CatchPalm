package com.ssafy.catchpalm.db.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.Setter;
import org.checkerframework.checker.units.qual.C;
import org.springframework.context.annotation.Lazy;

import javax.persistence.*;
import java.sql.Blob;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 유저 모델 정의.
 */
@Entity
@Getter
@Setter
public class User{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_number")
    private Long userNumber = null;

    @Column(unique = true, nullable = false)
    private String userId;

    @JsonIgnore
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    @Column(unique = true, nullable = true)
    private String nickname = null;

    @Lob
    @Column(name = "profile_img", columnDefinition = "Blob")
    private Blob profileImg;

    @Column(name = "profile_music")
    private String  profileMusic;

    private int point = 0;

    private double synk = 0.01;

    private int age = 0;

    // 0:남자, 1:여자, 2:기타
    private int sex = 0;

    @Column(name = "game_sound")
    private double gameSound = 0.5;
    @Column(name = "effect_sound")
    private double effectSound = 0.5;
    @Column(name = "back_sound")
    private double backSound = 0.3;
    @Column(name = "is_cam")
    private int isCam = 0;

    @Column(name = "refresh_token",length = 1024)
    private String refreshToken;

    // 0:오프라인, 1:온라인, 2:게임중
    private int status = 0;

    @Column(name = "join_date", nullable = false, updatable = false)
    private LocalDateTime joinDate;

    @Column(name = "email_verification_token",nullable = false,length = 1024)
    private String emailVerificationToken;

    @Column(name = "email_verified",nullable = false)
    private int emailVerified = 0;
    //민우추가
    @OneToMany(mappedBy = "userLike", fetch = FetchType.LAZY)
    private List<MusicLike> likeList = new ArrayList<>(); // 양방향 매핑: 좋아요 정보 리스트
    @OneToOne(mappedBy = "captain")
    private GameRoom gameRoom;
    @OneToOne(mappedBy = "user")
    private GameRoomUserInfo userInfo;

    public User() {
        this.joinDate = LocalDateTime.now(); // 가입일을 현재 시간으로 자동 설정
    }

}
