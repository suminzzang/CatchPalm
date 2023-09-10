package com.ssafy.catchpalm.db.entity;

import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
public class Board {
    @Id @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "board_number")
    private int boardNumber; // 게시글 고유번호 : PK

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_number")
    private Category category; //게시글 카테고리

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_number")
    private User user; // 게시글 작성자 정보: 단방향 매핑.

    private String title; // 게시글 제목

    private String content; // 게시글 내용

    @ColumnDefault("0")
    private int hit; // 게시글 조회수

    private LocalDateTime createdDate; // 게시글 작성일

    private LocalDateTime updatedDate; // 게시글 수정일

    @ColumnDefault("0")
    private int isFixed; // 게시글 수정 여부 : 0 = 수정x, 1 = 수정o

    @OneToMany(mappedBy = "board")
    private List<BoardComment> comments = new ArrayList<>(); // 게시글 댓글 리스트: 양방향 매핑.
}
