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
@Table(name = "chatbot_tb")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Chatbot {
    @Id
    @Column(name = "croom_idx")
    @EqualsAndHashCode.Include
    // 방 식별자
    private int croomIdx;

    // 방 제목
    @Column(name = "croom_title")
    private String croomTitle;

    // 방 소개
    @Column(name = "croom_desc")
    private String croomDesc;

    // 방 개설자
    @Column(name = "user_email")
    private String userEmail;

    // 방 인원수
    @Column(name = "croom_limit", insertable = false) // 업데이트 불가능
    private Integer croomLimit;

    // 방 개설일자
    @Column(name = "created_at", insertable = false) // 업데이트 불가능
    private Timestamp createdAt;

    // 방 상태
    @Column(name = "croom_status") // 업데이트 불가능
    private String croomStatus;
}
