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
@Table(name = "alarm_tb")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Alarm {

    // 알림 ID
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "alarm_id")
    @EqualsAndHashCode.Include
    private int alarmId;

    // 사용자 ID
    @Column(name = "user_email")
    private String userEmail;

    // 알림 시간
    @Column(name = "alarm_time")
    private Timestamp alarmTime;

    // 선톡 메시지
    @Column(name = "alarm_msg")
    private String alarmMsg;
}
