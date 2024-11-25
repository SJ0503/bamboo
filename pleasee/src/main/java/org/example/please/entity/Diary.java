package org.example.please.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.sql.Timestamp;
import java.sql.Date;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@ToString
@Table(name = "diary_tb")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Diary {

    @Id
    @Column(name = "diary_idx")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private int diaryIdx; // 일기 ID

    @Column(name = "user_email")
    private String userEmail; // 사용자 이메일

    @Column(name = "emotion_tag")
    private String emotionTag; // 감정 태그

    @Column(name = "diary_content")
    private String diaryContent; // 일기 내용

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "diary_weather")
    private String diaryWeather; // 날씨

    @Column(name = "diary_photo", columnDefinition = "JSON")
    private String diaryPhoto; // 여러 이미지 경로를 저장하는 JSON 배열 형식

    @Column(name = "diary_date")
    private Date diaryDate; // 일기 날짜


}
