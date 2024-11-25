package org.example.please.service;

import jakarta.transaction.Transactional;
import org.example.please.entity.UserToken;
import org.example.please.repository.UserTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class TokenService {

    @Autowired
    private UserTokenRepository tokenRepository;

    // 토큰 등록 또는 업데이트
    public void registerOrUpdateToken(UserToken tokenRequestDto) {
        String userEmail = tokenRequestDto.getUserEmail();
        String token = tokenRequestDto.getToken();
        // 동일한 토큰이 다른 이메일로 이미 등록되어 있는지 확인
        Optional<UserToken> existingToken = tokenRepository.findByToken(token);
        // 토큰 중복 확인
        if (existingToken.isPresent()) {
            // 동일한 토큰이 이미 등록되어 있다면 이메일 업데이트
            UserToken userToken = existingToken.get();
            userToken.setUserEmail(userEmail);
            tokenRepository.save(userToken);
        } else {
            // 기존에 토큰이 없는 경우 새로 저장
            UserToken userToken = new UserToken();
            userToken.setUserEmail(userEmail);
            userToken.setToken(token);
            tokenRepository.save(userToken);
        }
    }
    @Transactional
    public void removeToken(String userEmail, String token) {
        try {
            if (userEmail == null || token == null) {
                throw new IllegalArgumentException("User email or token cannot be null");
            }

            // 토큰 삭제 로직
            tokenRepository.deleteByUserEmailAndToken(userEmail, token);
            System.out.println("Token removed successfully for email: " + userEmail + ", token: " + token);
        } catch (Exception e) {
            // 예외가 발생한 경우 로그 출력
            System.err.println("Failed to remove token: " + e.getMessage());
            throw e; // 예외를 상위로 다시 전달
        }
    }
}
