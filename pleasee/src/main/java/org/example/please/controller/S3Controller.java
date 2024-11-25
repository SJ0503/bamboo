package org.example.please.controller;

import org.example.please.service.S3Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/s3")
public class S3Controller {

    @Autowired
    private S3Service s3Service;

    /**
     * S3 업로드 엔드포인트
     *
     * @param file 업로드할 파일
     * @return 업로드된 파일의 S3 URL
     */
    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            String fileUrl = s3Service.uploadFile(file);
            Map<String, String> response = new HashMap<>();
            response.put("imageUrl", fileUrl);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "파일 업로드 실패: " + e.getMessage()));
        }
    }

//    /**
//     * S3 파일 삭제 엔드포인트 (선택 사항)
//     *
//     * @param fileName 삭제할 파일 이름
//     * @return 성공 또는 실패 메시지
//     */
//    @DeleteMapping("/delete/{fileName}")
//    public ResponseEntity<Map<String, String>> deleteFile(@PathVariable String fileName) {
//        try {
//            s3Service.deleteFile(fileName);
//            return ResponseEntity.ok(Map.of("message", "파일 삭제 성공"));
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body(Map.of("error", "파일 삭제 실패: " + e.getMessage()));
//        }
//    }
}

//