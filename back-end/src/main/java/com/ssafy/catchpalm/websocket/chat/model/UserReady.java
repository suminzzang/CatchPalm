package com.ssafy.catchpalm.websocket.chat.model;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserReady {
   int roomNumber;
   Long userNumber;
   int isReady; // 0: 레디x | 1: 레디o
   private MessageType type;
}
