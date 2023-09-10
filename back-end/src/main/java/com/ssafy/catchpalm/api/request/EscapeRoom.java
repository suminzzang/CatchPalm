package com.ssafy.catchpalm.api.request;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Getter;
import lombok.Setter;

/**
 * 유저 로그인 API ([POST] /api/v1/auth/login) 요청에 필요한 리퀘스트 바디 정의.
 */
@Getter
@Setter
@ApiModel("EscapeRoomReq")
public class EscapeRoom {
	@ApiModelProperty(name="방 번호", example="1")
	int roomNumber;
	@ApiModelProperty(name="방 내 게임 회차", example="2")
	int playCnt;
	@ApiModelProperty(name="유저 넘버", example="5")
	Long userNumber;
}
