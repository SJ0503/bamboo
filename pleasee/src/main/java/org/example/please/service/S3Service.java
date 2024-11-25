package org.example.please.service;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.PutObjectRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Service
public class S3Service {
    @Autowired
    private AmazonS3 amazonS3;

    private final String bucketName = "yangproject";

    public String uploadFile(MultipartFile file) {
        String uniqueFileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        try {
            amazonS3.putObject(new PutObjectRequest(bucketName, uniqueFileName, file.getInputStream(), null));
            String fileUrl = amazonS3.getUrl(bucketName, uniqueFileName).toString();
            System.out.println("Uploaded File URL: " + fileUrl); // 로그 추가
            return fileUrl;
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("S3 업로드 중 에러 발생", e);
        }
    }
}

//