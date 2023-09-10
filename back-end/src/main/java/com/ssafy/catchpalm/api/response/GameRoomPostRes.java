package com.ssafy.catchpalm.api.response;

import com.ssafy.catchpalm.db.entity.*;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@ApiModel("GameRoomResponse")
public class GameRoomPostRes {
    @ApiModelProperty(name="GameRoom Number")
    int roomNumber;

    @ApiModelProperty(name="GameRoom captainNickName")
    String nickname;

    @ApiModelProperty(name="GameRoom Type")
    String typeName;

    @ApiModelProperty(name="GameRoom capacity")
    int capacity; // 게임방 총 정원

    @ApiModelProperty(name="GameRoom cntUser")
    int cntUser; // 게임방 현재정원

    @ApiModelProperty(name="GameRoom password")
    String password; // 게임방 비밀번호, NULL 여부로 비번 유무 확인.

    @ApiModelProperty(name="GameRoom title")
    String title; // 게임방 제목

    @ApiModelProperty(name="GameRoom status")
    int status; // 게임방 상태 : 0 = wait, 1 = gaming

    @ApiModelProperty(name="GameRoom musicnumber")
    int musicNumber; // 선정 곡 넘버

    @ApiModelProperty(name="GameRoom musicName")
    String musicName; // 선정 곡 이름

    @ApiModelProperty(name="GameRoom thumbnail")
    String thumbnail; // 선정 썸네일

    @ApiModelProperty(name="Music list")
    List<MusicPostRes> musics; // 음악리스트

    @ApiModelProperty(name="GameRoom platCnt")
    int playCnt; // 게임 횟수

    @ApiModelProperty(name="GameRoom category")
    int category; // 게임룸 카테고리
    public static GameRoomPostRes of(GameRoom gameRoom, List<MusicPostRes> musicList) {
        GameRoomPostRes res = new GameRoomPostRes();
        res.setRoomNumber(gameRoom.getRoomNumber());
        res.setCapacity(gameRoom.getCapacity());
        res.setPassword(gameRoom.getPassword());
        res.setStatus(gameRoom.getStatus());
        res.setCntUser(gameRoom.getUserInfos().size());
        res.setNickname(gameRoom.getCaptain().getNickname());
        res.setTitle(gameRoom.getTitle());
        res.setTypeName(gameRoom.getCategory().getName());
        res.setMusicNumber(gameRoom.getMusic().getMusicNumber());
        res.setMusicName(gameRoom.getMusic().getMusicName());
        res.setThumbnail(gameRoom.getMusic().getThumbnail());
        res.setPlayCnt(gameRoom.getPlayCnt());
        res.setCategory(gameRoom.getCategory().getCategoryNumber());
        if (musicList != null){
            res.setMusics(musicList);
        }
        return res;
    }
}
