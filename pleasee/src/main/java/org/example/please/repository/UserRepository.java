package org.example.please.repository;

import jakarta.transaction.Transactional;
import org.example.please.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {
    // 단순 이메일체크
    boolean existsByUserEmail(String userEmail);
    // 해당 이메일로 사용자 정보를 조회할때 유용함.
   Optional<User> findByUserEmail(String userEmail);
        @Transactional
        @Modifying
        @Query("UPDATE User u SET u.chatbotLevel = :newLevel WHERE u.userEmail = :email")
        void updateChatbotLevel(@Param("email") String email, @Param("newLevel") int newLevel);



    // 관리자 메서드들
    // 전체 사용자 수 카운트
    @Query("SELECT COUNT(u) FROM User u")
    long countTotalUsers();

    // 오늘 활동한 사용자 수 카운트
    @Query("SELECT COUNT(DISTINCT u.userEmail) FROM User u WHERE u.userEmail IN " +
            "(SELECT DISTINCT c.userEmail FROM Chatting c WHERE DATE(c.createdAt) = CURRENT_DATE) " +
            "OR u.userEmail IN " +
            "(SELECT DISTINCT d.userEmail FROM Diary d WHERE DATE(d.createdAt) = CURRENT_DATE)")
    long countActiveUsersToday();

    // 일기만 사용하는 사용자 수
    @Query("SELECT COUNT(DISTINCT u.userEmail) FROM User u " +
            "WHERE EXISTS (SELECT d FROM Diary d WHERE d.userEmail = u.userEmail) " +
            "AND NOT EXISTS (SELECT c FROM Chatting c WHERE c.userEmail = u.userEmail)")
    long countDiaryOnlyUsers();

    // 챗봇만 사용하는 사용자 수
    @Query("SELECT COUNT(DISTINCT u.userEmail) FROM User u " +
            "WHERE EXISTS (SELECT c FROM Chatting c WHERE c.userEmail = u.userEmail) " +
            "AND NOT EXISTS (SELECT d FROM Diary d WHERE d.userEmail = u.userEmail)")
    long countChatOnlyUsers();

    // 둘 다 사용하는 사용자 수
    @Query("SELECT COUNT(DISTINCT u.userEmail) FROM User u " +
            "WHERE EXISTS (SELECT d FROM Diary d WHERE d.userEmail = u.userEmail) " +
            "AND EXISTS (SELECT c FROM Chatting c WHERE c.userEmail = u.userEmail)")
    long countBothUsers();

    // 이용하지 않는 사용자 수
    @Query("SELECT COUNT(DISTINCT u.userEmail) FROM User u " +
            "WHERE NOT EXISTS (SELECT d FROM Diary d WHERE d.userEmail = u.userEmail) " +
            "AND NOT EXISTS (SELECT c FROM Chatting c WHERE c.userEmail = u.userEmail)")
    long countInactiveUsers();

    //날짜별 가입자 수
    @Query("SELECT DATE(u.joinedAt), COUNT(u) FROM User u GROUP BY DATE(u.joinedAt) ORDER BY DATE(u.joinedAt)")
    List<Object[]> findSignupTrends();

    // 모든 사용자와 가입 날짜를 가져오기
    @Query("SELECT u FROM User u")
    List<User> findAllUsersWithJoinDate();

    // 사용자의 상태를 가져오기 (Chatbot 테이블의 croomStatus 사용, null일 경우 inactive)
    @Query("SELECT u FROM User u WHERE EXISTS (" +
            "SELECT c FROM Chatbot c WHERE c.userEmail = u.userEmail AND " +
            "COALESCE(c.croomStatus, 'inactive') = 'active')")
    List<User> findActiveUsers();

    @Query("SELECT u.chatbotLevel FROM User u WHERE u.userEmail = :userEmail")
    int findChatbotLevelByUserEmail(@Param("userEmail") String userEmail);

    @Query("SELECT u.chatbotName FROM User u WHERE u.userEmail = :userEmail")
    String findChatbotNameByUserEmail(@Param("userEmail") String userEmail);
}
