package org.example.please.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.please.entity.Diary;
import org.example.please.repository.DiaryRepository;
import org.example.please.service.DiaryService;
import org.example.please.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.example.please.service.S3Service; // S3 서비스 추가

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/diaries")
public class DiaryController {

    @Autowired
    private DiaryService diaryService;

    @Autowired
    private UserService userService;


    @Autowired
    private S3Service S3Service; // S3 업로드 서비스 추가

    @Autowired
    private DiaryRepository diaryRepository;
    /**
     * 사진을 포함한 일기 작성
     */
    @PostMapping("/create-with-photo")
    public ResponseEntity<Diary> createDiaryWithPhoto(
            @RequestPart("diary") String diaryData,
            @RequestPart(value = "photo", required = false) List<MultipartFile> photoFiles) throws IOException {

        // JSON 데이터를 Diary 객체로 변환
        ObjectMapper objectMapper = new ObjectMapper();
        Diary diary = objectMapper.readValue(diaryData, Diary.class);

        // 사진 업로드 및 URL 생성
        List<String> photoUrls = new ArrayList<>();
        if (photoFiles != null && !photoFiles.isEmpty()) {
            for (MultipartFile file : photoFiles) {
                // 파일을 S3에 업로드하고 반환된 URL을 저장
                try {
                    String photoUrl = S3Service.uploadFile(file); // S3 업로드 후 URL 반환
                    if (photoUrl != null && !photoUrl.isEmpty()) {
                        photoUrls.add(photoUrl);
                    } else {
                        System.err.println("S3 URL 생성 실패: " + file.getOriginalFilename());
                    }
                } catch (Exception e) {
                    System.err.println("S3 업로드 실패: " + file.getOriginalFilename() + " 오류: " + e.getMessage());
                }
            }
        }

        // S3 URL만 JSON 배열로 변환하여 Diary 객체에 저장
        diary.setDiaryPhoto(objectMapper.writeValueAsString(photoUrls)); // JSON 배열로 변환하여 저장

        // 일기 생성 및 저장
        Diary newDiary = diaryService.createDiary(diary, null);

        // 챗봇 레벨 업데이트
        try {
            userService.updateChatbotLevelAfterDiaryCreation(diary.getUserEmail());
            System.out.println("챗봇 레벨 업데이트 완료: " + diary.getUserEmail());
        } catch (Exception e) {
            System.err.println("챗봇 레벨 업데이트 실패: " + e.getMessage());
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(newDiary);
    }


    /**
     * 사용자 이메일을 기준으로 일기 조회
     */
    @GetMapping("/user_diaries")
    public ResponseEntity<List<Map<String, Object>>> getDiariesByUserEmail(@RequestParam String userEmail) {
        List<Diary> diaries = diaryService.getDiariesByUserEmail(userEmail);

        // JSON 배열의 사진 데이터를 URL 리스트로 변환
        List<Map<String, Object>> diaryWithUrls = diaries.stream().map(diary -> {
            Map<String, Object> diaryMap = new HashMap<>();
            diaryMap.put("diaryIdx", diary.getDiaryIdx());
            diaryMap.put("userEmail", diary.getUserEmail());
            diaryMap.put("diaryDate", diary.getDiaryDate());
            diaryMap.put("emotionTag", diary.getEmotionTag());
            diaryMap.put("diaryWeather", diary.getDiaryWeather());
            diaryMap.put("diaryContent", diary.getDiaryContent());
            diaryMap.put("createdAt", diary.getCreatedAt());

            // S3 URL을 그대로 반환
            diaryMap.put("diaryPhoto", diary.getDiaryPhoto());
            return diaryMap;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(diaryWithUrls);
    }

    /**
     * 월별 일기 조회
     */
    @GetMapping("/month")
    public ResponseEntity<List<Map<String, Object>>> getMonthDiaries(
            @RequestParam String userEmail,
            @RequestParam int year,
            @RequestParam int month) {

        List<Diary> diaries = diaryService.getDiariesByMonth(userEmail, year, month);

        // JSON 배열의 사진 데이터를 URL 리스트로 변환
        List<Map<String, Object>> diaryWithUrls = diaries.stream().map(diary -> {
            Map<String, Object> diaryMap = new HashMap<>();
            diaryMap.put("diaryIdx", diary.getDiaryIdx());
            diaryMap.put("userEmail", diary.getUserEmail());
            diaryMap.put("diaryDate", diary.getDiaryDate());
            diaryMap.put("emotionTag", diary.getEmotionTag());
            diaryMap.put("diaryWeather", diary.getDiaryWeather());
            diaryMap.put("diaryContent", diary.getDiaryContent());
            diaryMap.put("createdAt", diary.getCreatedAt());

            // S3 URL을 그대로 반환
            diaryMap.put("diaryPhoto", diary.getDiaryPhoto());
            return diaryMap;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(diaryWithUrls);
    }
}

//