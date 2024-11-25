package org.example.please.controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.logging.Level;
import java.util.logging.Logger;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/uploads/profile/images")
public class FileController {

    private static final Logger logger = Logger.getLogger(FileController.class.getName());

    // 프로필 이미지 기본 저장 디렉토리
    private final String profileImageDir = "C:/uploads/profile/images/";

    /**
     * 이미지 파일 제공 메서드
     * 클라이언트 요청에 따라 프로필 이미지를 제공하는 엔드포인트입니다.
     *
     * @param fileName 제공할 파일 이름
     * @return 해당 이미지 파일의 리소스 또는 에러 상태
     */
    @GetMapping("/{fileName}")
    public ResponseEntity<Resource> getImage(@PathVariable String fileName) {
        try {
            Path filePath = Paths.get(profileImageDir).resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                logger.log(Level.INFO, "Serving image file: {0}", fileName);
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .header(HttpHeaders.CONTENT_TYPE, Files.probeContentType(filePath))
                        .body(resource);
            } else {
                logger.log(Level.WARNING, "File not found or is not readable: {0}", fileName);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Error occurred while serving file: " + fileName, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}
