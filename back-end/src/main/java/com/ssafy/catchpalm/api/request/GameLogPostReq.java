package com.ssafy.catchpalm.api.request;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Getter;
import lombok.Setter;

/**
 * 게임 로그 기록 ([POST] /api/v1/auth/login) 요청에 필요한 리퀘스트 바디 정의.
 */
@Getter
@Setter
@ApiModel("GameLogPostReq")
public class GameLogPostReq {
    @ApiModelProperty(name="음악 번호", example="1")
    int musicNumber;
    @ApiModelProperty(name="유저 번호", example="5")
    Long userNumber;
    @ApiModelProperty(name="유저 점수", example="3212332")
    int score;
    @ApiModelProperty(name="게임방 번호",example = "232")
    int roomNumber;
    @ApiModelProperty(name="게임방 게임 횟수",example = "2")
    int playCnt;
}
