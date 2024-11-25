package org.example.please.repository;

import org.example.please.entity.Chatbot;
import org.example.please.entity.Chatting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

public interface ChatbotRepository extends JpaRepository<Chatbot, Integer> {

    Chatbot findByUserEmail(String userEmail);

    @Query("SELECT c FROM Chatting c WHERE c.croomIdx = :croomIdx ORDER BY c.createdAt ASC")
    List<Chatting> findByCroomIdxOrderByCreatedAtAsc(@Param("croomIdx") int croomIdx);
}
