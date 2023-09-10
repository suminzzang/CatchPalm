package com.ssafy.catchpalm.db.dto;

import com.ssafy.catchpalm.api.response.UserRes;
import com.ssafy.catchpalm.db.entity.User;
import lombok.Getter;
import lombok.Setter;

import java.io.InputStream;
import java.sql.Blob;
import java.util.Base64;

@Getter
@Setter
public class UserDTO {
    private Long userNumber;
    private String userId;
    private String nickname;
    private String profileImg;

    public UserDTO(Long userNumber, String userId, String nickname,String profileImg) {
        this.userNumber = userNumber;
        this.userId = userId;
        this.nickname = nickname;
        this.profileImg = profileImg;
    }

    public static UserDTO fromEntity(User user) {
        String proImg = "";
        try {
            if (user.getProfileImg() != null) {
                InputStream inputStream = user.getProfileImg().getBinaryStream();
                byte[] bytes = new byte[(int) user.getProfileImg().length()];
                inputStream.read(bytes);
                inputStream.close();

                proImg = Base64.getEncoder().encodeToString(bytes);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return new UserDTO(user.getUserNumber(), user.getUserId(), user.getNickname(), proImg);
    }
}