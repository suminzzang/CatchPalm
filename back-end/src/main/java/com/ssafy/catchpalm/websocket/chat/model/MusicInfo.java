package com.ssafy.catchpalm.websocket.chat.model;

import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MusicInfo {
    private int musicNumber;
    private String musicName;
    private int roomNumber;
    private MessageType type;
    private int isStart;
}
