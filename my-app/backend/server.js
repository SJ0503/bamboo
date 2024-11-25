const express = require('express');
const axios = require('axios');
const { Expo } = require('expo-server-sdk');
const fs = require('fs'); // 파일 시스템 모듈 추가
const app = express();
const expo = new Expo();

app.use(express.json()); // JSON 요청 바디를 파싱

// 기본 라우트 확인
app.get('/', (req, res) => {
    res.send('Server is running!');
});

// Spring API URL
const SPRING_API_URL = `http://localhost:8082/api/tokens/tokens-with-chatbot`;
const SPRING_CHAT_API_URL = 'http://localhost:8082/api/chat/addAlarmMessage';
const MESSAGE_FILE_PATH = './message.json';

// JSON 파일에서 메시지 읽기 함수
function getRandomMessage() {
    try {
        const messages = JSON.parse(fs.readFileSync(MESSAGE_FILE_PATH, 'utf8'));
        const randomIndex = Math.floor(Math.random() * messages.length);
        return messages[randomIndex];
    } catch (error) {
        console.error('Error reading message file:', error);
        return 'Default notification message';
    }
}

// 푸시 알림 전송 API
app.post('/send-bulk-notification', async (req, res) => {
    try {
        // Spring API에서 데이터 가져오기
        const response = await axios.get(SPRING_API_URL);
        const tokensData = response.data; // [{ token, chatbotName, userEmail }, ...]

        if (!tokensData || tokensData.length === 0) {
            return res.status(404).send('No tokens found');
        }
        const randomMessage = getRandomMessage();
        // 사용자별 랜덤 메시지 생성
        const messages = tokensData.map((tokenData) => {
           // 각 사용자에 대해 새로운 메시지 선택
            return {
                to: tokenData.token,
                sound: 'default',
                title: tokenData.chatbotName,
                body: randomMessage,
                data: { userEmail: tokenData.userEmail, croomIdx:tokenData.croomIdx},
                channelId: 'default',
            };
        });

        // 메시지 청크로 나누기
        const chunks = expo.chunkPushNotifications(messages);

        // Expo 서버로 알림 전송
        for (const chunk of chunks) {
            try {
                const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                ticketChunk.forEach((ticket, index) => {
                    if (ticket.status === 'error') {
                        console.error(
                            `Error sending notification to ${chunk[index].to}:`,
                            ticket.message
                        );
                    }
                });
            } catch (error) {
                console.error('Error sending chunk:', error);
            }
        }
        const uniqueTokensData = Object.values(
            tokensData.reduce((acc, tokenData) => {
                // userEmail을 키로 사용하여 중복 제거
                acc[tokenData.userEmail] = tokenData;
                return acc;
            }, {})
        );


        // Spring Chat API에 알림 데이터 저장
        await Promise.all(
            uniqueTokensData.map(async (tokenData) => {
                try {
                    await axios.post(SPRING_CHAT_API_URL, {
                        chatContent: randomMessage, // 위에서 생성된 메시지 사용
                        chatter: 'bot',
                        userEmail: tokenData.userEmail,
                        emotionTag: 'notification',
                        croomIdx: tokenData.croomIdx,
                    });
                } catch (error) {
                    console.error('Error saving chat to Spring:', error);
                }
            })
        );

        res.status(200).send('Bulk notification sent successfully');
    } catch (error) {
        console.error('Error sending bulk notification:', error);
        res.status(500).send('Failed to send bulk notification');
    }
});

// 서버 실행
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
