package org.example.please.controller;

import lombok.RequiredArgsConstructor;
import org.example.please.entity.User;
import org.example.please.service.DashboardService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.*;  // CrossOrigin을 위해 추가

import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(
        origins = "http://127.0.0.1:5500",  // VS Code Live Server의 기본 포트
        allowedHeaders = "*",
        methods = {RequestMethod.GET}  // GET 메서드만 허용
)
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Long>> getDashboardStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalUsers", dashboardService.getTotalUsers());
        stats.put("activeUsersToday", dashboardService.getActiveUsersToday());
        stats.put("totalDiaries", dashboardService.getTodayDiaryCount());
        stats.put("todayChatSessions", dashboardService.getTodayChattingSessions());

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/weekly-activity")
    public ResponseEntity<Map<String, List<Long>>> getWeeklyActivity() {
        Map<String, List<Long>> weeklyStats = dashboardService.getWeeklyActivity();
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(weeklyStats);
    }

    @GetMapping("/users-stats")
    public ResponseEntity<Map<String, Long>> getUserServiceStats() {
        return ResponseEntity.ok(dashboardService.getUserServiceStats());
    }

    @GetMapping("/signup-trend")
    public ResponseEntity<Map<String, Long>> getSignupTrend() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        Map<String, Long> signupTrends = dashboardService.getSignupTrends().entrySet().stream()
                .collect(Collectors.toMap(
                        entry -> entry.getKey().format(formatter), // LocalDate를 지정된 형식의 String으로 변환
                        Map.Entry::getValue
                ));

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(signupTrends);
    }

    @GetMapping("/users-with-join-date")
    public ResponseEntity<List<User>> getAllUsersWithJoinDate() {
        List<User> users = dashboardService.getAllUsersWithJoinDate();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/active-users")
    public ResponseEntity<List<User>> getActiveUsers() {
        List<User> activeUsers = dashboardService.getActiveUsers();
        return ResponseEntity.ok(activeUsers);
    }







}
