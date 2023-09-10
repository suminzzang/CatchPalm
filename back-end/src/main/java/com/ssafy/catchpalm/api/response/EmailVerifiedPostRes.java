package com.ssafy.catchpalm.api.response;

import com.ssafy.catchpalm.common.model.response.BaseResponseBody;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Getter;
import lombok.Setter;

/**
 * 유저 로그인 API ([POST] /api/v1/auth) 요청에 대한 응답값 정의.
 */
@Getter
@Setter
@ApiModel("UserLoginPostResponse")
public class EmailVerifiedPostRes extends BaseResponseBody{
	@ApiModelProperty(name="이메일 인증 여부", example="0 or 1")
	int emailVerified;
	
	public static EmailVerifiedPostRes of(Integer statusCode, String message, int emailVerified) {
		EmailVerifiedPostRes res = new EmailVerifiedPostRes();
		res.setStatusCode(statusCode);
		res.setMessage(message);
		res.setEmailVerified(emailVerified);
		return res;
	}
}
