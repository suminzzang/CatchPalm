package com.ssafy.catchpalm.api.service;

import com.ssafy.catchpalm.api.request.GameLogPostReq;
import com.ssafy.catchpalm.db.dto.MusicDTO;
import com.ssafy.catchpalm.db.dto.RankDTO;
import com.ssafy.catchpalm.db.dto.RecordsDTO;
import com.ssafy.catchpalm.db.entity.*;
import com.ssafy.catchpalm.db.repository.MusicRepository;
import com.ssafy.catchpalm.db.repository.RankRepository;
import com.ssafy.catchpalm.db.repository.RecordsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service("gameService")
public class GameServiceImpl implements GameService {

    @Autowired
    RankRepository rankRepository;

    @Autowired
    RecordsRepository recordsRepository;

    @Autowired
    MusicRepository musicRepository;

    @Override
    public void createLog(GameLogPostReq gameInfo){
        Records records = new Records();
        User user = new User();
        Music music = new Music();
        GameRoom gameRoom = new GameRoom();
        music.setMusicNumber(gameInfo.getMusicNumber());
        records.setMusic(music);
        user.setUserNumber(gameInfo.getUserNumber());
        records.setUser(user);
        records.setScore(gameInfo.getScore());
        gameRoom.setRoomNumber(gameInfo.getRoomNumber());
        records.setRoomNumber(gameInfo.getRoomNumber());
        records.setPlayCnt(gameInfo.getPlayCnt());
        recordsRepository.save(records);
    }

    @Override
    public List<RecordsDTO> getRecords(int roomNumber, int playCnt){
        List<Records> records = recordsRepository.findByRoomNumberAndPlayCntOrderByScoreDesc(roomNumber,playCnt);

        return records.stream()
                .map(RecordsDTO::fromEntity)
                .collect(Collectors.toList());

    }

    @Override
    public void createRank(GameLogPostReq gameInfo){
        Optional<Rank> optionalRank = rankRepository.findByRankUserUserNumberAndMusicMusicNumber(gameInfo.getUserNumber(), gameInfo.getMusicNumber());
        Rank rank = null;
        if(!optionalRank.isPresent()){
            rank = new Rank();
            User user = new User();
            Music music = new Music();
            music.setMusicNumber(gameInfo.getMusicNumber());
            rank.setMusic(music);
            user.setUserNumber(gameInfo.getUserNumber());
            rank.setRankUser(user);
            rank.setScore(gameInfo.getScore());
        }else{
            rank = optionalRank.get();
            if(gameInfo.getScore()>=rank.getScore()) {
                rank.setScore(gameInfo.getScore());
                rank.setPlayDateTime(LocalDateTime.now());
            }
        }
        rankRepository.save(rank);
    }

    @Override
    public List<RankDTO> getRanksByMusicNumber(int musicNumber) {
        // 랭크 리스트가 비어 있을 경우, 이 코드는 빈 Rank 리스트를 반환합니다.
        List<Rank> ranks = rankRepository.findTop50ByMusicMusicNumberOrderByScoreDesc(musicNumber);

        return ranks.stream()
                .map(RankDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<MusicDTO> getMusicList(){
        List<Music> musics = musicRepository.findAll();

        return musics.stream()
                .map(MusicDTO::fromEntity)
                .collect(Collectors.toList());
    }



    @Override
    public RankDTO getRankByUserNumberAndMusicNumber(long userNumber, int musicNumber){
        Optional<Rank> optionalRank = rankRepository.findByRankUserUserNumberAndMusicMusicNumber(userNumber, musicNumber);
        if(!optionalRank.isPresent()){
            return null;
        }
        Rank rank = optionalRank.get();
        return RankDTO.fromEntity(rank);
    }

    @Override
    public int getRanking(long userNumber, int musicNumber){
        return rankRepository.getRankingForUser(userNumber,musicNumber);
    }


}
