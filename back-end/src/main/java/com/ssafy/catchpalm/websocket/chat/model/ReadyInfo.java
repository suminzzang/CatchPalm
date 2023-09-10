package com.ssafy.catchpalm.websocket.chat.model;

import lombok.*;

import java.sql.Blob;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReadyInfo {
    private List<UserReady> userReadies;
}
