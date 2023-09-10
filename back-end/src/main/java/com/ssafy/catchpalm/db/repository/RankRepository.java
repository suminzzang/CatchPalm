package com.ssafy.catchpalm.db.repository;


import com.ssafy.catchpalm.db.entity.Rank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RankRepository extends JpaRepository<Rank, Integer> {

    Optional<Rank> findByRankUserUserNumberAndMusicMusicNumber(long userNumber, int musicNumber);
    List<Rank> findTop50ByMusicMusicNumberOrderByScoreDesc(int musicNumber);

    @Query("SELECT COUNT(r) + 1 FROM RANKING r WHERE r.music.musicNumber = :musicNumber AND r.score > (SELECT r2.score FROM RANKING  r2 WHERE r2.rankUser.userNumber = :userNumber AND r2.music.musicNumber = :musicNumber)")
    int getRankingForUser(@Param("userNumber") long userNumber,@Param("musicNumber") int musicNumber);

}
