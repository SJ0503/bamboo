package org.example.please.service;

import org.example.please.entity.Feedback;
import org.example.please.repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class FeedbackService {

    @Autowired
    private FeedbackRepository feedbackRepository;

    public void saveFeedback(Feedback feedback) {
       feedbackRepository.save(feedback);

    }
}