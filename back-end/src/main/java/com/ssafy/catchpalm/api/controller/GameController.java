package com.ssafy.catchpalm.api.controller;

import com.ssafy.catchpalm.api.request.*;
import com.ssafy.catchpalm.api.response.*;
import com.ssafy.catchpalm.api.service.GameRoomService;
import com.ssafy.catchpalm.api.service.GameService;
import com.ssafy.catchpalm.api.service.UserService;
import com.ssafy.catchpalm.common.auth.SsafyUserDetails;
import com.ssafy.catchpalm.common.model.response.BaseResponseBody;
import com.ssafy.catchpalm.db.dto.MusicDTO;
import com.ssafy.catchpalm.db.dto.RankDTO;
import com.ssafy.catchpalm.db.dto.RecordsDTO;
import com.ssafy.catchpalm.db.entity.GameRoom;
import com.ssafy.catchpalm.db.entity.GameRoomUserInfo;
import com.ssafy.catchpalm.db.entity.Rank;
import com.ssafy.catchpalm.db.entity.User;
import io.swagger.annotations.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import springfox.documentation.annotations.ApiIgnore;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * 게임 관련 API 요청 처리를 위한 컨트롤러 정의.
 */
@Api(value = "게임 API", tags = {"Game"})
@RestController
@RequestMapping("/api/v1/game")
public class GameController {

    @Autowired
    GameService gameService;

    @PostMapping("/log")
    @ApiOperation(value = "로그 기록", notes = "<strong>게임 기록을 넘겨주면</strong>로그를 기록한다.")
    @ApiResponses({
            @ApiResponse(code = 200, message = "성공"),
            @ApiResponse(code = 401, message = "인증 실패"),
            @ApiResponse(code = 404, message = "사용자 없음"),
            @ApiResponse(code = 500, message = "서버 오류")
    })
    public ResponseEntity<BaseResponseBody> createLog(
            @RequestBody @ApiParam(value="방 정보", required = true) GameLogPostReq gameInfo) {

        // 로그 기록
        gameService.createLog(gameInfo);
        // 랭킹 업데이트
        gameService.createRank(gameInfo);

        return ResponseEntity.status(200).body(BaseResponseBody.of(200, "Success"));
    }

    @GetMapping("/result")
    @ApiOperation(value = "게임 결과", notes = "<strong>방 번호를 보내주면</strong>점수를 가져온다.")
    @ApiResponses({
            @ApiResponse(code = 200, message = "성공"),
            @ApiResponse(code = 401, message = "인증 실패"),
            @ApiResponse(code = 404, message = "사용자 없음"),
            @ApiResponse(code = 500, message = "서버 오류")
    })
    public ResponseEntity<GameResultPostRes> getRcords(
            @RequestParam("roomNumber") int roomNumber,@RequestParam("playCnt") int playCnt) {

        // 로그 기록
        List<RecordsDTO> results = gameService.getRecords(roomNumber,playCnt);

        return ResponseEntity.status(200).body(GameResultPostRes.of(200, "Success",results));
    }

    @GetMapping("/rank")
    @ApiOperation(value = "곡에 대한 랭킹 기록", notes = "<strong>뮤직 넘버와 유저 넘버를 넘겨주면</strong>곡에 대한 랭킹을 제공한다. (유저 넘버를 안보내면 전체 랭킹을 보낸다")
    @ApiResponses({
            @ApiResponse(code = 200, message = "성공"),
            @ApiResponse(code = 401, message = "인증 실패"),
            @ApiResponse(code = 404, message = "사용자 없음"),
            @ApiResponse(code = 500, message = "서버 오류")
    })
    public ResponseEntity<RankListPostRes> getRank(@RequestParam("musicNumber") int musicNumber
            , @RequestParam(value = "userNumber", required = false) Long userNumber) {
        List<RankDTO> ranks = gameService.getRanksByMusicNumber(musicNumber);
        RankDTO rank = null;
        int userRanking = 0;
        if(userNumber!=null){
            rank = gameService.getRankByUserNumberAndMusicNumber(userNumber, musicNumber);
            userRanking = gameService.getRanking(userNumber, musicNumber);
            if(rank==null){
                userRanking=0;
            }

        }
        return ResponseEntity.status(200).body(RankListPostRes.of(200, "Success",ranks,rank,userRanking));
    }

    @GetMapping("/music")
    @ApiOperation(value = "곡에 대한 리스트", notes = "<strong>뮤직 넘버와 유저 넘버를 넘겨주면</strong>곡에 대한 랭킹을 제공한다. (유저 넘버를 안보내면 전체 랭킹을 보낸다")
    @ApiResponses({
            @ApiResponse(code = 200, message = "성공"),
            @ApiResponse(code = 401, message = "인증 실패"),
            @ApiResponse(code = 404, message = "사용자 없음"),
            @ApiResponse(code = 500, message = "서버 오류")
    })
    public ResponseEntity<MusicListPostRes> getMusic() {
        List<MusicDTO> musics = gameService.getMusicList();
        return ResponseEntity.status(200).body(MusicListPostRes.of(200, "Success",musics));
    }
}