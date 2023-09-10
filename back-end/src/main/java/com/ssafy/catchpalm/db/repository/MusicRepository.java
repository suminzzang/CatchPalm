package com.ssafy.catchpalm.db.repository;

import com.ssafy.catchpalm.db.entity.GameRoom;
import com.ssafy.catchpalm.db.entity.Music;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 음악 관련 디비 쿼리 생성을 위한 JPA Query Method 인터페이스 정의.
 */
@Repository
public interface MusicRepository extends JpaRepository<Music, Integer> {
    // 모든 Music 엔티티 조회
    List<Music> findAll();
}