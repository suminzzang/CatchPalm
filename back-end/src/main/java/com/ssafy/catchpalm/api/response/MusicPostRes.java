package com.ssafy.catchpalm.api.response;

import com.ssafy.catchpalm.common.model.response.BaseResponseBody;
import com.ssafy.catchpalm.db.entity.Music;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;

/**
 * 유저 로그인 API ([POST] /api/v1/auth) 요청에 대한 응답값 정의.
 */
@Getter
@Setter
@ApiModel("UserLoginPostResponse")
public class MusicPostRes{
	@ApiModelProperty(name="music_number", example="1")
	private int musicNumber; // 음악 고유번호(개인키)

	@ApiModelProperty(name="music_name", example="좋은날")
	private String musicName; // 음악 이름

	@ApiModelProperty(name="runningTime", example="00:02:10")
	private LocalTime runningTime; // 음악 재생시간

	@ApiModelProperty(name="singer", example="아이유")
	private String singer; // 가수

	@ApiModelProperty(name="composer", example="아이유")
	private String composer; // 작곡가

	@ApiModelProperty(name="level", example="쉬움")
	private String level; // 난이도

	@ApiModelProperty(name="play_cnt", example="10")
	private int playCnt; // 난이도

	@ApiModelProperty(name="music_thumbnail", example="이미지주소")
	private String thumbnail; // 난이도

	public static MusicPostRes of(Music music) {
		MusicPostRes res = new MusicPostRes();
		res.setMusicNumber(music.getMusicNumber());
		res.setMusicName(music.getMusicName());
		res.setComposer(music.getComposer());
		res.setSinger(music.getSinger());
		res.setPlayCnt(music.getPlayCnt());
		res.setRunningTime(music.getRunningTime());
		res.setLevel(music.getLevel());
		res.setThumbnail(music.getThumbnail());
		return res;
	}

}
