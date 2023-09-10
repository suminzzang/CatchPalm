package com.ssafy.catchpalm.api.request;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Getter;
import lombok.Setter;

/**
 * 게임방 입장검증 api Req
 */
@Getter
@Setter
@ApiModel("AuthenticationRoomReq")
public class AuthenticationRoomReq {
	@ApiModelProperty(name="게임방 번호", example="1")
	int roomNumber;
	@ApiModelProperty(name="게임방 비밀번호", example="djdji2")
	String password;
}
