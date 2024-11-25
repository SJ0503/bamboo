package org.example.please.repository;

import org.example.please.entity.UserToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserTokenRepository extends JpaRepository<UserToken, Long> {

    // 특정 사용자와 토큰으로 중복 체크
    boolean existsByUserEmailAndToken(String userEmail, String token);

    // 특정 사용자의 모든 토큰 삭제
    void deleteAllByUserEmail(String userEmail);
//    / 특정 토큰으로 데이터 조
    Optional<UserToken> findByToken(String token);

    void deleteByUserEmailAndToken(String userEmail, String token);

    @Query("SELECT ut.token, u.chatbotName, u.userEmail, u.quietStartTime, u.quietEndTime, cb.croomIdx " +
            "FROM UserToken ut " +
            "JOIN User u ON ut.userEmail = u.userEmail " +
            "JOIN Chatbot cb ON u.userEmail = cb.userEmail " +
            "WHERE cb.croomStatus = 'inactive'")
    List<Object[]> findTokensWithChatbotNameAndInactiveStatus();

}