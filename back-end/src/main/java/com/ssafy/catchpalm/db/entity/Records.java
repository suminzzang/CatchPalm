package com.ssafy.catchpalm.db.entity;

import lombok.Getter;
import lombok.Setter;
import org.checkerframework.checker.units.qual.C;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class Records {
    @Id @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "records_number")
    private Long recordsNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "music_number")
    private Music music;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_number")
    private User user;

    @Column(name = "room_number")
    private int roomNumber;

    @Column(name = "play_cnt")
    private int playCnt;


    private int score;

    @Column(name = "play_datetime", nullable = false, updatable = false)
    private LocalDateTime playDateTime;

    public Records() {
        this.playDateTime = LocalDateTime.now(); // 가입일을 현재 시간으로 자동 설정
    }
}
