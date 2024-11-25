package org.example.please.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.DynamicInsert;

import java.sql.Time;
import java.sql.Timestamp;
import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@ToString
@Table(name = "user_tb")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@DynamicInsert
public class User {

    // 사용자 ID
    @Id
    @Column(name = "user_email")
    @EqualsAndHashCode.Include
    private String userEmail;

    // 비밀번호
    @Column(name = "user_pw")
    private String userPw;

    // 유저 닉네임
    @Column(name = "user_nick")
    private String userNick;

    // 생년월일
    @Column(name = "user_birthdate")
    @Temporal(TemporalType.DATE)
    private Date userBirthdate;

    // 방해금지 시작
    @Column(name = "quiet_start_time", nullable = false, insertable = false)
    private Time quietStartTime;

    // 방해금지 끝
    @Column(name = "quiet_end_time", nullable = false, insertable = false)
    private Time quietEndTime;

    // 챗봇 타입
    @Column(name = "chatbot_type")
    private String chatbotType;

    // 가입 일자
    @Column(name = "joined_at", nullable = false, insertable = false)
    private Timestamp joinedAt;

    // 챗봇 이름
    @Column(name = "chatbot_name")
    private String chatbotName;

    // 챗봇 레벨
    @Column(name = "chatbot_level")
    private int chatbotLevel;

    // 유저 프로필 이미지 경로
    @Column(name = "user_profile")
    private String userProfile;

    // 알람받기
    @Column(name = "toggle", nullable = false)
    private boolean toggle;


    // 프로필 이미지 경로 가져오기 메서드
    public String getProfileImage() {
        return userProfile;
    }

    // 필요에 따라 프로필 이미지 설정 메서드 추가
    public void setProfileImage(String profileImage) {
        this.userProfile = profileImage;
    }
}
