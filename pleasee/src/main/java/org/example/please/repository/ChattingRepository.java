package org.example.please.repository;

import jakarta.transaction.Transactional;
import org.example.please.entity.Chatting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;


public interface ChattingRepository extends JpaRepository<Chatting, Integer> {

    @Query(value = "SELECT * FROM chatting_tb WHERE croom_idx = ?1 ORDER BY created_at DESC LIMIT 1", nativeQuery = true)
    Chatting findLatestChatByCroomIdx(int croomIdx);

    @Modifying
    @Transactional
    @Query("UPDATE Chatting c SET c.evaluation = :evaluation WHERE c.chatIdx = :chatIdx")
    int updateEvaluationByChatIdx(int chatIdx, String evaluation);

    // chatIdx로 채팅 메시지 조회
    Chatting findByChatIdx(int chatIdx);

    // 특정 세션에서 첫 번째 사용자 메시지의 chatContent를 찾는 메서드
    @Query("SELECT c.chatContent FROM Chatting c WHERE c.croomIdx = :croomIdx AND c.sessionIdx = :sessionIdx AND c.chatter = 'user' ORDER BY c.createdAt ASC LIMIT 1")
    Optional<String> findFirstUserMessageContentInSession(@Param("croomIdx") int croomIdx, @Param("sessionIdx") Integer sessionIdx);


    // 특정 채팅방의 마지막 메시지를 찾는 메서드
    @Query("SELECT c.chatContent FROM Chatting c WHERE c.croomIdx = :croomIdx AND c.sessionIdx = :sessionIdx AND c.chatter = 'bot' ORDER BY c.createdAt DESC LIMIT 1")
    Optional<String> findLatestMessageInRoom(@Param("croomIdx") Integer croomIdx, @Param("sessionIdx") Integer sessionIdx);

    // 관리자페이지 메서드
    // 오늘의 채팅 세션 수 카운트
    @Query("SELECT COUNT(DISTINCT c.sessionIdx) FROM Chatting c WHERE DATE(c.createdAt) = CURRENT_DATE")
    long countTodayChattingSessions();

    @Query("SELECT COUNT(c) FROM Chatting c WHERE c.userEmail = :userEmail AND c.croomIdx IN " +
            "(SELECT DISTINCT croomIdx FROM Chatting WHERE userEmail = :userEmail)")
    int countByUserEmailAndCroomIdx(@Param("userEmail") String userEmail);

    @Modifying
    @Query("UPDATE Chatbot c SET c.croomStatus = :status WHERE c.userEmail = :userEmail")
    int updateCroomStatusByEmail(@Param("userEmail") String userEmail, @Param("status") String status);
    
    // 특정 기간 동안 날짜별로 채팅 기록의 개수 집계
    @Query("SELECT DATE(c.createdAt) as date, COUNT(c) as count " +
            "FROM Chatting c " +
            "WHERE c.createdAt BETWEEN :startDate AND :endDate " +
            "GROUP BY DATE(c.createdAt) " +
            "ORDER BY DATE(c.createdAt)")
    List<Object[]> countByDateBetween(@Param("startDate") LocalDateTime startDate,
                                      @Param("endDate") LocalDateTime endDate);


}
