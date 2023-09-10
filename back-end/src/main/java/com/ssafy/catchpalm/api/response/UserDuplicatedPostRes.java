package com.ssafy.catchpalm.api.response;

import com.ssafy.catchpalm.common.model.response.BaseResponseBody;
import com.ssafy.catchpalm.db.entity.User;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@ApiModel("UserDuplicatedResponse")
public class UserDuplicatedPostRes extends BaseResponseBody {
    @ApiModelProperty(name="isDuplicated")
    boolean isDuplicated;

    public static UserDuplicatedPostRes of(Integer statusCode, String message, boolean isDuplicated) {
        UserDuplicatedPostRes res = new UserDuplicatedPostRes();
        res.setStatusCode(statusCode);
        res.setMessage(message);
        res.setDuplicated(isDuplicated);
        return res;
    }
}
