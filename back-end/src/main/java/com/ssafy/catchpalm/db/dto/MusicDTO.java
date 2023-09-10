package com.ssafy.catchpalm.db.dto;

import com.ssafy.catchpalm.db.entity.Music;
import com.ssafy.catchpalm.db.entity.User;
import lombok.Getter;
import lombok.Setter;

import java.sql.Blob;
import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class MusicDTO {
    private int musicNumber;
    private String musicName;
    private String singer;
    private String thumbnail;
    private String level;
    private String mp4Address;
    private String backgroundAddress;
    private LocalDate releaseDate;
    private LocalTime runningTime;

    public MusicDTO(int musicNumber, String musicName, String singer, String thumbnail, String level, String mp4Address
            , String backgroundAddress, LocalDate releaseDate, LocalTime runningTime) {
        this.musicNumber = musicNumber;
        this.musicName = musicName;
        this.singer = singer;
        this.thumbnail = thumbnail;
        this.level = level;
        this.mp4Address = mp4Address;
        this.backgroundAddress = backgroundAddress;
        this.releaseDate = releaseDate;
        this.runningTime = runningTime;
    }

    public static MusicDTO fromEntity(Music music) {
        return new MusicDTO(music.getMusicNumber(),music.getMusicName(), music.getSinger(), music.getThumbnail(),music.getLevel()
        ,music.getMp4Address(),music.getBackgroundAddress(),music.getReleaseDate(),music.getRunningTime());
    }
}