package org.example.please.entity;

import jakarta.persistence.*;
import lombok.*;

import java.sql.Timestamp;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@ToString
@Table(name = "feedback_tb")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Feedback {
    @Id
    @Column(name = "feedback_idx")
    @EqualsAndHashCode.Include
    // 피드백 식별자
    private int feedbackIdx;

    // 채팅 식별자
    @Column(name = "chat_idx")
    private int chatIdx;

    // 평가 점수
    @Column(name = "chatbot_score")
    private Integer chatbotScore;

    // 사용자 아이디
    @Column(name = "user_email")
    private String userEmail;

    // 등록 일자
    @Column(name = "created_at")
    private Timestamp createdAt;
}
