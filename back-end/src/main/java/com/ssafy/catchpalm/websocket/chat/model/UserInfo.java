package com.ssafy.catchpalm.websocket.chat.model;

import lombok.*;

import java.sql.Blob;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserInfo {
    private Long userNumber;
    private String profileImg;
    private String nickname;
    private int ready;
}
