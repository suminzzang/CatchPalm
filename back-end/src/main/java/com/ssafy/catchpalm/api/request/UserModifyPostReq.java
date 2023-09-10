package com.ssafy.catchpalm.api.request;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.Column;
import java.sql.Blob;

/**
 * 유저 정보 수정 API ([POST] /api/v1/users) 요청에 필요한 리퀘스트 바디 정의.
 */
@Getter
@Setter
@ApiModel("UserModifyPostRequest")
public class UserModifyPostReq {
	@ApiModelProperty(name="유저 nickname", example="your_nickname")
	String nickname;
	@ApiModelProperty(name="유저 Password", example="your_password")
	String password;
	@ApiModelProperty(name="유저 age", example="your_age")
	String age;
	@ApiModelProperty(name="유저 sex", example="your_sex")
	String sex;
	@ApiModelProperty(name="유저 프로필 이미지", example="your_img")
	String profileImg;
	@ApiModelProperty(name="유저 프로필 음악", example="your_music")
	String profileMusic;
	@ApiModelProperty(name="유저 synk", example="your_synk")
	String synk;
	@ApiModelProperty(name="유저 gameSound", example="your_synk")
	String gameSound;
	@ApiModelProperty(name="유저 effectSound", example="your_synk")
	String effectSound;
	@ApiModelProperty(name="유저 backSound", example="your_synk")
	String backSound;
	@ApiModelProperty(name="유저 isCam", example="your_synk")
	String isCam;
}
