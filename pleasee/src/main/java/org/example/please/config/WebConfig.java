package org.example.please.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // /uploads/images/db/** 경로를 통해 이미지 파일을 접근하도록 설정
        registry.addResourceHandler("/uploads/images/db/**")
                .addResourceLocations("file:/C:/uploads/images/db/")
                .setCachePeriod(3600); // 캐싱 시간 설정
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // CORS 설정 추가
        registry.addMapping("/**") // 모든 경로에 대해 CORS 허용
                .allowedOrigins("*") // 모든 도메인 허용
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // 허용할 HTTP 메서드
                .allowedHeaders("*") // 모든 헤더 허용
                .allowCredentials(false) // 인증 정보 허용 여부
                .maxAge(3600); // 옵션 요청 캐싱 시간 (초 단위)
    }
}
//