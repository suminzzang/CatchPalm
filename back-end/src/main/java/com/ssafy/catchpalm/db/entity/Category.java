package com.ssafy.catchpalm.db.entity;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

@Entity(name = "CATEGORY")
@Getter
@Setter
public class Category {
    @Id @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "category_number")
    private int categoryNumber; // 카테고리 고유번호 : PK

    @Column(nullable = false)
    private int type; // 카테고리 타입 번호 : 0 = 게임모드, 1 = 게임모션, 2 = 게시글

    @Column(nullable = false)
    private int value; // 카테고리 값(넘버링)

    @Column(nullable = false)
    private String name; // 카테고리 value 이름.

    public Category(int type, int value, String name) {
        this.type = type;
        this.value = value;
        this.name = name;
    }

    public Category() {
    }
}
