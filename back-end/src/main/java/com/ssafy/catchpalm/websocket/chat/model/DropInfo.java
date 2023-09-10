package com.ssafy.catchpalm.websocket.chat.model;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DropInfo {
    private String nickname;
    private int roomNumber;
    private MessageType type;
}
