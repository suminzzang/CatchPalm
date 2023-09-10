package com.ssafy.catchpalm.db.repository;
import com.ssafy.catchpalm.db.entity.Rank;
import com.ssafy.catchpalm.db.entity.Records;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecordsRepository extends JpaRepository<Records, Integer> {
    List<Records> findByRoomNumberAndPlayCntOrderByScoreDesc(int roomNumber,int playCnt);
}
