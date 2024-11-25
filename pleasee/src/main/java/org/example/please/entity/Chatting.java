package org.example.please.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.sql.Timestamp;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@ToString
@Table(name = "chatting_tb")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class  Chatting {
    @Id
    @Column(name = "chat_idx")
    @EqualsAndHashCode.Include
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    // 채팅 식별자
    private int chatIdx;

    // 방 식별자
    @Column(name = "croom_idx")
    private int croomIdx;

    // 발화자
    @Column(name = "chatter")
    private String chatter;

    // 발화 내용
    @Column(name = "chat_content")
    private String chatContent;

    // 발화 이모티콘
    @Column(name = "chat_emoticon")
    private String chatEmoticon;

    // 발화 파일
    @Column(name = "chat_file")
    private String chatFile;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private Timestamp createdAt;
    // 감정 태그
    @Column(name = "emotion_tag")
    private String emotionTag;

    // 세션 식별자
    @Column(name = "session_idx")
    private int sessionIdx;

    // 평가
    @Column(name = "evaluation")
    private String evaluation;

    private String userEmail;

    // keyword
    @Column(name = "emotion_keyword")
    private String emotionKeyword;



}
