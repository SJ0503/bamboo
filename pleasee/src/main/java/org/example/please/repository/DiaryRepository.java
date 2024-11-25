package org.example.please.repository;

import org.example.please.entity.Diary;
import org.example.please.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

public interface DiaryRepository extends JpaRepository<Diary, Integer> {

    // 특정 날짜에 작성된 모든 사용자의 일기 가져오기 (diaryDate 필드를 기준으로)
    List<Diary> findByDiaryDateBetween(Date start, Date end);

    // 특정 사용자가 특정 날짜에 작성한 일기 가져오기 (diaryDate 필드를 기준으로)
    List<Diary> findByUserEmailAndDiaryDateBetween(String userEmail, Date start, Date end);

    @Query(value = "SELECT d.* FROM diary_tb d JOIN user_tb u ON d.user_email = u.user_email WHERE u.user_email = :userEmail", nativeQuery = true)
    List<Diary> findDiariesByUserEmail(@Param("userEmail") String userEmail);

    @Query("SELECT d FROM Diary d WHERE d.userEmail = :userEmail AND YEAR(d.createdAt) = :year AND MONTH(d.createdAt) = :month")
    List<Diary> findByUserEmailAndYearAndMonth(String userEmail, int year, int month);

    @Query("SELECT COUNT(d) FROM Diary d WHERE d.userEmail = :userEmail")
    int countByUserEmail(@Param("userEmail") String userEmail);

    // 관리자 메서드
    // 오늘 일기 수 카운트
    @Query("SELECT COUNT(*) FROM Diary d WHERE d.createdAt >= :startOfDay AND d.createdAt < :endOfDay")
    long countTodayDiaries(@Param("startOfDay") LocalDateTime startOfDay, @Param("endOfDay") LocalDateTime endOfDay);

    // 일기 작성 통계
    @Query("SELECT DATE(d.createdAt) as date, COUNT(d) as count " + //작성 일자 별 해당 날짜 일기 수
            "FROM Diary d " +
            "WHERE d.createdAt BETWEEN :startDate AND :endDate " + //날짜 범위 지정
            "GROUP BY DATE(d.createdAt) " +                        //날짜별로 그룹화
            "ORDER BY DATE(d.createdAt)")                          //날짜순 정렬
    List<Object[]> countByDateBetween(@Param("startDate") LocalDateTime startDate, //시작일
                                      @Param("endDate") LocalDateTime endDate); //종료일


}
