package org.example.please.service;

//import org.example.please.NotificationMessageLoader;
import org.example.please.entity.Alarm;
import org.example.please.repository.AlarmRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class AlarmService {
    @Autowired
    private AlarmRepository alarmRepository;


}
