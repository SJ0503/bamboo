// ChatController.java
package org.example.please.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.example.please.entity.Chatbot;
import org.example.please.entity.Chatting;
import org.example.please.entity.User;
import org.example.please.repository.ChattingRepository;
import org.example.please.repository.UserRepository;
import org.example.please.service.ChattingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChattingController {

    @PersistenceContext
    private EntityManager entityManager; // EntityManager 주입

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private ChattingService chattingService;


    @Autowired
    private ChattingRepository chattingRepository;
    @Autowired
    private UserRepository userRepository;

    public Map<String, Object> sendUserMessage(String userEmail, int croomIdx, int sessionIdx, String chatContent, String chatbotName) {
        Map<String, Object> response = new HashMap<>();

        String url = "https://1952-121-147-12-202.ngrok-free.app/predict";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        try {
            Map<String, Object> requestPayload = new HashMap<>();
            String firstUserMessage = chattingService.getFirstUserMessageInSession(croomIdx, sessionIdx);
            String previousMessage = chattingService.getLatestMessageInRoom(croomIdx, sessionIdx);

            firstUserMessage = firstUserMessage == null ? "[NO_FIRST]" : firstUserMessage;
            previousMessage = previousMessage == null ? "[NO_PREV]" : previousMessage;

            requestPayload.put("user_email", userEmail);
            requestPayload.put("croom_idx", croomIdx);
            requestPayload.put("session_idx", sessionIdx);
            requestPayload.put("first_user_message", firstUserMessage);
            requestPayload.put("previous_message", previousMessage);
            requestPayload.put("current_user_message", chatContent);
            requestPayload.put("chatbot_name", chatbotName);

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestPayload, headers);
            ResponseEntity<Map> ngrokResponse = restTemplate.postForEntity(url, requestEntity, Map.class);

            response = ngrokResponse.getBody() != null ? ngrokResponse.getBody() : new HashMap<>();
        } catch (Exception e) {
            response.put("error", "An error occurred while processing the message.");
        }
        return response;
    }


    @Transactional
    @PostMapping("/getChatResponse")
    public ResponseEntity<Map<String, Object>> getChatResponse(@RequestBody Chatting chatting) {
        LocalDateTime now = LocalDateTime.now();
        String chatbotName = userRepository.findChatbotNameByUserEmail(chatting.getUserEmail());
        System.out.println(chatbotName);
        try {
            // 최신 채팅 기록 조회 및 세션 인덱스 설정
            Chatting latestChatting = chattingRepository.findLatestChatByCroomIdx(chatting.getCroomIdx());
            if (latestChatting != null) {
                LocalDateTime latestCreatedAt = latestChatting.getCreatedAt().toLocalDateTime();
                chatting.setSessionIdx(latestChatting.getSessionIdx());

                if (Duration.between(latestCreatedAt, now).toMinutes() > 30) {
                    chatting.setSessionIdx(latestChatting.getSessionIdx() + 1);
                }
            } else {
                chatting.setSessionIdx(1);
            }
            ObjectMapper mapper = new ObjectMapper();
            //            모델한테 보내고 답받기
            Map<String, Object> botResponseToUser = sendUserMessage(chatting.getUserEmail(), chatting.getCroomIdx(), chatting.getSessionIdx(), chatting.getChatContent(), chatbotName);

            if (botResponseToUser.get("bot_response") == null) {
                System.out.println("botResponseToUser is null. No messages will be saved.");
                return ResponseEntity.status(HttpStatus.NO_CONTENT).body(null);
            }
            String userEmotionTag = mapper.writeValueAsString(botResponseToUser.get("current_emotion_probabilities"));
//            chatting.setEmotionTag(userEmotionTag);

            String botContent = null;
            String botResponseObject = (String) botResponseToUser.get("bot_response");
            String emotionKeyword = (String) botResponseToUser.get("emotion_keyword");
//            if (botResponseObject instanceof Map) {
//                Map<String, Object> botResponseMap = (Map<String, Object>) botResponseObject;
//                botContent = (String) botResponseMap.get("content");
//            }

            System.out.println("Bot Content: " + botResponseObject);
            // 사용자 메시지 저장



            // 봇 응답  저장
            String botEmotionTag = mapper.writeValueAsString(botResponseToUser.get("current_emotion_probabilities"));

            chatting.setEmotionTag(botEmotionTag);

            if ("user".equals(chatting.getChatter())) {

                chattingService.saveChatbotDialogue(chatting);
                entityManager.flush();
                entityManager.clear();
                System.out.println("userChatIdxxxx" + chattingService.saveChatbotDialogue(chatting));
            }

            Chatting botResponse = saveBotMessage(chatting.getCroomIdx(), chatting.getSessionIdx(), botResponseObject, emotionKeyword);
            // 응답 데이터 생성
            Map<String, Object> response = new HashMap<>();
            response.put("chatContent", botResponse.getChatContent());
            response.put("chatIdx", botResponse.getChatIdx()); // 저장된 chatIdx 반환
            response.put("evaluation", botResponse.getEvaluation());
            response.put("sessionIdx", botResponse.getSessionIdx());


            System.out.println("Returning chatIdx: " + botResponse.getChatIdx()); // 디버그 로그
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Error occurred while processing chat response.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    private Chatting saveBotMessage(int croomIdx, int sessionIdx, String content, String emotionKeyword) {
        Chatting botMessage = new Chatting();
        botMessage.setCroomIdx(croomIdx);
        botMessage.setSessionIdx(sessionIdx);
        botMessage.setChatContent(content);
        botMessage.setChatter("bot");
        botMessage.setEmotionKeyword(emotionKeyword);

        return chattingRepository.saveAndFlush(botMessage);
    }

    @PostMapping("/create_room")
    public ResponseEntity<Map<String, Object>> createRoom(@RequestBody Chatbot chatbot) {
        Map<String, Object> response = new HashMap<>();
        chattingService.createRoom(chatbot);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/getChatHistory")
    public ResponseEntity<List<Chatting>> getChatHisotry(@RequestParam Integer croomIdx) {
        // 특정 방 ID의 채팅 기록을 가져옴
        List<Chatting> chatHistory = chattingService.getChatHistory(croomIdx);
        return ResponseEntity.ok(chatHistory);
    }

    @PutMapping("/updateEvaluation")
    public ResponseEntity<String> updateEvaluation(@RequestBody Chatting chatting) {
        int rowsUpdated = chattingService.updateEvaluation(chatting.getChatIdx(), chatting.getEvaluation());
        if (rowsUpdated > 0) {
            return ResponseEntity.ok("평가완료");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Chat message not found");
        }
    }

    // 메시지 삭제 엔드포인트 추가
    @DeleteMapping("/deleteMessage")
    public ResponseEntity<String> deleteMessage(@RequestParam Integer chatIdx) {
        boolean isDeleted = chattingService.deleteChatMessage(chatIdx);
        if (isDeleted) {
            return ResponseEntity.ok("Message deleted successfully");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Chat message not found");
        }
    }

    @PostMapping("/updateUserStatus")
    public ResponseEntity<String> updateUserStatus(@RequestBody Map<String, String> payload) {
        String userEmail = payload.get("userEmail");
        String status = payload.get("status");
        System.out.println("status: " + status + "userEmail" + userEmail);

        try {
            chattingService.updateCroomStatus(userEmail, status);
            return ResponseEntity.ok("User status updated successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating user status: " + e.getMessage());
        }
    }

    @PostMapping("/addAlarmMessage")
    public ResponseEntity<String> addAlarmMessage(@RequestBody Chatting alarmRequest) {
        LocalDateTime now = LocalDateTime.now();
        try {
            // 최신 채팅 기록 조회 및 세션 인덱스 설정
            Chatting latestChatting = chattingRepository.findLatestChatByCroomIdx(alarmRequest.getCroomIdx());
            if (latestChatting != null) {
                LocalDateTime latestCreatedAt = latestChatting.getCreatedAt().toLocalDateTime();
                alarmRequest.setSessionIdx(latestChatting.getSessionIdx());

                if (Duration.between(latestCreatedAt, now).toMinutes() > 30) {
                    alarmRequest.setSessionIdx(latestChatting.getSessionIdx() + 1);
                }
            } else {
                alarmRequest.setSessionIdx(1);
            }

            // 알림 메시지 저장
            chattingService.saveAlarm(alarmRequest);

            return ResponseEntity.ok("Alarm message saved successfully with sessionIdx: " + alarmRequest.getSessionIdx());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to save alarm message: " + e.getMessage());
        }
    }
}

