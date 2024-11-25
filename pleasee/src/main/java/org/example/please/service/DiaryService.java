package org.example.please.service;

import org.example.please.entity.Diary;
import org.example.please.entity.User;
import org.example.please.repository.DiaryRepository;
import org.example.please.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.sql.Timestamp;

import java.util.*;


@Service
public class DiaryService {

    @Autowired
    private DiaryRepository diaryRepository;

    @Autowired
    private UserRepository userRepository;



    public List<Diary> getAllDiaries() {
        return diaryRepository.findAll();
    }

    /**
     * 사진을 포함한 일기 작성
     */
    public Diary createDiary(Diary diary, List<MultipartFile> photoFiles) throws IOException {
        if (diary.getCreatedAt() == null) {
            diary.setCreatedAt(new Timestamp(System.currentTimeMillis()).toLocalDateTime());
        }

        return diaryRepository.save(diary);
    }

    /**
     * 사용자 이메일을 기준으로 일기 데이터 조회
     */
    public List<Diary> getDiariesByUserEmail(String userEmail) {
        Optional<User> user = userRepository.findByUserEmail(userEmail);
        if (user.isPresent()) {
            return diaryRepository.findDiariesByUserEmail(userEmail);
        } else {
            throw new RuntimeException("사용자를 찾을 수 없습니다.");
        }
    }

    /**
     * 월별 사용자 일기 조회
     */
    public List<Diary> getDiariesByMonth(String userEmail, int year, int month) {
        return diaryRepository.findByUserEmailAndYearAndMonth(userEmail, year, month);
    }

}

//