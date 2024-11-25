package org.example.please.controller;

import org.example.please.entity.User;
import org.example.please.entity.UserToken;
import org.example.please.repository.UserTokenRepository;
import org.example.please.service.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.Time;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tokens")
public class TokenController {

    @Autowired
    private TokenService tokenService;
    @Autowired
    private UserTokenRepository userTokenRepository;

    // 토큰 등록
    @PostMapping("/register")
    public ResponseEntity<String> registerOrUpdateToken(@RequestBody UserToken tokenRequestDto) {
        tokenService.registerOrUpdateToken(tokenRequestDto);
        return ResponseEntity.ok("Token registered successfully");
    }

    // 특정 사용자의 모든 토큰 삭제
    @PostMapping("/remove")
    public ResponseEntity<String> removeToken(@RequestBody UserToken request) {
        try {
            // 요청 데이터 검증
            if (request.getUserEmail() == null || request.getToken() == null) {
                return ResponseEntity.badRequest().body("User email or token is missing");
            }
            // 토큰 삭제 서비스 호출
            tokenService.removeToken(String.valueOf(request.getUserEmail()), request.getToken());
            return ResponseEntity.ok("Token removed successfully");
        } catch (Exception e) {
            // 예외 발생 시 로그 출력
            System.err.println("Failed to remove token: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to remove token");
        }
    }

    @GetMapping("/tokens-with-chatbot")
    public ResponseEntity<List<Map<String, Object>>> getFilteredTokens() {
        List<Object[]> results = userTokenRepository.findTokensWithChatbotNameAndInactiveStatus();

        // 현재 시간
        LocalTime now = LocalTime.now();

        // 필터링된 결과 리스트 생성
        List<Map<String, Object>> filteredResults = results.stream()
                .filter(result -> {
                    LocalTime startTime = ((Time) result[3]).toLocalTime();
                    LocalTime endTime = ((Time) result[4]).toLocalTime();

                    // Quiet Time 범위 확인
                    if (startTime.isBefore(endTime)) {
                        // 같은 날의 범위
                        return now.isBefore(startTime) || now.isAfter(endTime);
                    } else {
                        // 밤 10시 ~ 아침 6시와 같은 경우
                        return now.isAfter(endTime) && now.isBefore(startTime);
                    }
                })
                .map(result -> {
                    // 필터링된 데이터를 Map 형식으로 반환
                    Map<String, Object> map = new HashMap<>();
                    map.put("token", result[0]);
                    map.put("chatbotName", result[1]);
                    map.put("userEmail", result[2]);
                    map.put("croomIdx",result[5]);
                    return map;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(filteredResults);
    }
}
