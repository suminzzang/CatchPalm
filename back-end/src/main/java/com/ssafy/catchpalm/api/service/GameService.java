package com.ssafy.catchpalm.api.service;

import com.ssafy.catchpalm.api.request.GameLogPostReq;
import com.ssafy.catchpalm.db.dto.MusicDTO;
import com.ssafy.catchpalm.db.dto.RankDTO;
import com.ssafy.catchpalm.db.dto.RecordsDTO;
import com.ssafy.catchpalm.db.entity.Rank;

import java.util.List;

public interface GameService {
    void createLog(GameLogPostReq gameInfo);

    List<RecordsDTO> getRecords(int roomNumber, int playCnt);

    void createRank(GameLogPostReq gameinfo);

    List<RankDTO> getRanksByMusicNumber(int musicNumber);

    List<MusicDTO> getMusicList();

    RankDTO getRankByUserNumberAndMusicNumber(long userNumber, int musicNumber);

    int getRanking(long userNumber, int musicNumber);
}
