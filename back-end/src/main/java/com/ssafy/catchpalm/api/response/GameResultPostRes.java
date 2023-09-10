package com.ssafy.catchpalm.api.response;

import com.ssafy.catchpalm.common.model.response.BaseResponseBody;
import com.ssafy.catchpalm.db.dto.MusicDTO;
import com.ssafy.catchpalm.db.dto.RecordsDTO;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@ApiModel("GameResultResponse")
public class GameResultPostRes extends BaseResponseBody {
    @ApiModelProperty(name="Music list")
    List<RecordsDTO> records; // 결과 리스트

    public static GameResultPostRes of(Integer statusCode, String message, List<RecordsDTO> records) {
        GameResultPostRes res = new GameResultPostRes();
        res.setStatusCode(statusCode);
        res.setMessage(message);
        res.setRecords(records);
        return res;
    }
}
