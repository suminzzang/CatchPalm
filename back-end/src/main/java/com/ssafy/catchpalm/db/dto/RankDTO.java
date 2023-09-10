package com.ssafy.catchpalm.db.dto;

import com.ssafy.catchpalm.db.entity.Rank;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class RankDTO {
    private int rankNumber;
    private int score;
    private LocalDateTime playDateTime;
    private UserDTO userDTO;
    private MusicDTO musicDTO;

    public RankDTO(int rankNumber, int score, LocalDateTime playDateTime, UserDTO userDTO, MusicDTO musicDTO) {
        this.rankNumber = rankNumber;
        this.score = score;
        this.playDateTime = playDateTime;
        this.userDTO = userDTO;
        this.musicDTO = musicDTO;
    }

    public static RankDTO fromEntity(Rank rank){
        UserDTO userDto = UserDTO.fromEntity(rank.getRankUser());
        MusicDTO musicDTO = MusicDTO.fromEntity(rank.getMusic());
        return new RankDTO(rank.getRankNumber(), rank.getScore(), rank.getPlayDateTime(),userDto,musicDTO);
    }

}
