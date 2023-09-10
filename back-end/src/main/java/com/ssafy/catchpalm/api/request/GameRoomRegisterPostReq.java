package com.ssafy.catchpalm.api.request;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Getter;
import lombok.Setter;

/**
 * 유저 회원가입 API ([POST] /api/v1/users) 요청에 필요한 리퀘스트 바디 정의.
 */
@Getter
@Setter
@ApiModel("GameRoomRegisterPostRequest")
public class GameRoomRegisterPostReq {
	@ApiModelProperty(name="유저 number", example="1")
	Long userNumber;
	@ApiModelProperty(name="게임방 title", example="1대1 아무나")
	String title;
	@ApiModelProperty(name="게임방 capacity", example="2")
	int capacity;
	@ApiModelProperty(name="게임방 password", example="1234")
	String password;
	@ApiModelProperty(name="게임방 카테고리", example="1")
	int categoryNumber;
}
