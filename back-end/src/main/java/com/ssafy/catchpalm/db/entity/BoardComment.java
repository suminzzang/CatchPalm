package com.ssafy.catchpalm.db.entity;

import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class BoardComment {
    @Id @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "comment_number")
    private int commentNumber; // 댓글 고유번호 : PK

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_number")
    private Board board; // 해당 게시글 정보 : 단방향 매핑

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_number")
    private User user; // 댓글 작성자 정보 : 단방향 매핑

    private String content; // 댓글 내용

    private LocalDateTime createdDate; // 댓글 작성일

    private LocalDateTime updatedDate; // 댓글 수정일

    @ColumnDefault("0")
    private int isFixed; // 댓글 수정 여부 : 0 = 수정x, 1 = 수정o
}
