package com.ssafy.catchpalm.api.response;

import com.ssafy.catchpalm.common.model.response.BaseResponseBody;
import com.ssafy.catchpalm.db.dto.MusicDTO;
import com.ssafy.catchpalm.db.dto.RankDTO;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@ApiModel("MusicListResponse")
public class MusicListPostRes extends BaseResponseBody {
    @ApiModelProperty(name="Music list")
    List<MusicDTO> musics; // 음악리스트

    public static MusicListPostRes of(Integer statusCode, String message, List<MusicDTO> musics) {
        MusicListPostRes res = new MusicListPostRes();
        res.setStatusCode(statusCode);
        res.setMessage(message);
        res.setMusics(musics);
        return res;
    }
}
