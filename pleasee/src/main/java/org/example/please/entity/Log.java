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
@Table(name = "log_tb")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Log {
    @Id
    @Column(name = "log_id")
    @EqualsAndHashCode.Include
    private int logId;

    // 사용자 ID
    @Column(name = "user_email")
    private String userEmail;

    // 활동 유형
    @Column(name = "log_type")
    private String logType;

    // 활동 세부 정보
    @Column(name = "log_details")
    private String logDetails;

    // 로그 발생 시간
    @Column(name = "created_at")
    private Timestamp createdAt;

    // 활동 상태
    @Column(name = "log_status")
    private String logStatus;

    // 참조 테이블
    @Column(name = "log_table")
    private String logTable;
}
