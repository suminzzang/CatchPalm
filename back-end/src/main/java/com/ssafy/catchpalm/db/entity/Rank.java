package com.ssafy.catchpalm.db.entity;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity(name = "RANKING")
@Getter
@Setter
@JsonIdentityInfo(
        generator = ObjectIdGenerators.PropertyGenerator.class,
        property = "rankNumber")
public class Rank {
    @Id @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "rank_number")
    private int rankNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_number")
    private User rankUser; // 랭거 정보 : 단방향 매핑

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "music_number")
    private Music music; // 랭킹등록된 해당 음악 정보 : 단방향 매핑

    private int score; // 해당 점수

    @Column(name = "play_datetime", nullable = false)
    private LocalDateTime playDateTime; // 플레이 시작일

    public Rank() {
        this.playDateTime = LocalDateTime.now(); // 가입일을 현재 시간으로 자동 설정
    }
}
