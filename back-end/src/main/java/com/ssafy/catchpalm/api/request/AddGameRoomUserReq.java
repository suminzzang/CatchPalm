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
@ApiModel("AddGameRoomUserPostRequest")
public class AddGameRoomUserReq {
	@ApiModelProperty(name="유저 번호", example="1")
	Long userNumber;
	@ApiModelProperty(name="게임방 번호", example="5")
	int gameRoomNumber;
}
