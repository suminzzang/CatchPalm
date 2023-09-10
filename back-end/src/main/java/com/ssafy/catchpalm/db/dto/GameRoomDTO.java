package com.ssafy.catchpalm.db.dto;


import com.ssafy.catchpalm.db.entity.Category;
import com.ssafy.catchpalm.db.entity.GameRoom;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GameRoomDTO {
    private int RoomNumber;
    private int capacity;
    private String title;
    private Category category;

    public GameRoomDTO(int roomNumber, int capacity,String title, Category category){
        this.RoomNumber = roomNumber;
        this.capacity = capacity;
        this.category = category;
        this.title = title;
    }

    public static GameRoomDTO fromEntity(GameRoom gameRoom){
        return new GameRoomDTO(gameRoom.getRoomNumber(), gameRoom.getCapacity(), gameRoom.getTitle(), gameRoom.getCategory());
    }

}
