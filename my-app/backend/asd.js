// const express = require('express');
// const axios = require('axios');
// const { Expo } = require('expo-server-sdk');
// const fs = require('fs');
// const schedule = require('node-schedule');
//
// const app = express();
// const expo = new Expo();
//
// app.use(express.json()); // JSON 요청 바디를 파싱
//
// // Spring API URLs
// const SPRING_API_URL = `http://localhost:8082/api/tokens/tokens-with-chatbot`;
// const SPRING_CHAT_API_URL = 'http://localhost:8082/api/chat/add';
//
// // 메시지 파일 경로
// const MESSAGE_FILE_PATH = './message.json';
//
// // 스케줄링 시간 (시, 분 설정 가능)
// const scheduleTimes = [
//     { hour: 7, minute: 30 },
//     { hour: 13, minute: 45 },
//     { hour: 20, minute: 30 },
// ];
//
// // JSON 파일에서 랜덤 메시지 가져오기
// function getRandomMessage() {
//     try {
//         const messages = JSON.parse(fs.readFileSync(MESSAGE_FILE_PATH, 'utf8'));
//         const randomIndex = Math.floor(Math.random() * messages.length);
//         return messages[randomIndex];
//     } catch (error) {
//         console.error('Error reading message file:', error);
//         return 'Default message: Please check the message file.';
//     }
// }
//
// // 알림 전송 함수
// async function sendNotifications() {
//     try {
//         // Spring API에서 사용자 데이터 가져오기
//         const response = await axios.get(SPRING_API_URL);
//         const tokensData = response.data; // [{ token, chatbotName, userEmail }, ...]
//
//         if (!tokensData || tokensData.length === 0) {
//             console.warn('No tokens found for sending notifications.');
//             return;
//         }
//
//         // 사용자별 랜덤 메시지 생성
//         const messages = tokensData.map((tokenData) => {
//             const randomMessage = getRandomMessage();
//             return {
//                 to: tokenData.token,
//                 sound: 'default',
//                 title: `${tokenData.chatbotName}`,
//                 body: randomMessage,
//                 data: { userEmail: tokenData.userEmail },
//             };
//         });
//
//         // 메시지 청크로 나누기
//         const chunks = expo.chunkPushNotifications(messages);
//
//         // Expo 서버로 알림 전송
//         await Promise.all(
//             chunks.map(async (chunk) => {
//                 try {
//                     const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
//                     ticketChunk.forEach((ticket, index) => {
//                         if (ticket.status === 'error') {
//                             console.error(
//                                 `Error sending notification to ${chunk[index].to}:`,
//                                 ticket.message
//                             );
//                         }
//                     });
//                 } catch (error) {
//                     console.error('Error sending chunk:', error);
//                 }
//             })
//         );
//
//         console.log('Notifications sent successfully!');
//
//         // Spring Chat API에 알림 데이터 저장
//         await Promise.all(
//             tokensData.map(async (tokenData) => {
//                 try {
//                     await axios.post(SPRING_CHAT_API_URL, {
//                         chatContent: `Notification: ${getRandomMessage()}`,
//                         chatter: 'System',
//                         userEmail: tokenData.userEmail,
//                         emotionTag: 'notification', // 태그는 필요에 따라 수정
//                         sessionIdx: 0,
//                     });
//                 } catch (error) {
//                     console.error('Error saving chat to Spring:', error);
//                 }
//             })
//         );
//
//     } catch (error) {
//         console.error('Error in sendNotifications:', error);
//     }
// }
//
// // 스케줄링 설정
// scheduleTimes.forEach((time) => {
//     const cronExpression = `${time.minute} ${time.hour} * * *`;
//     schedule.scheduleJob(cronExpression, () => {
//         console.log(`Sending notifications at ${time.hour}:${time.minute}`);
//         sendNotifications();
//     });
// });
//
// // 기본 라우트 확인
// app.get('/', (req, res) => {
//     res.send('Server is running!');
// });
//
// // 수동 푸시 알림 전송 엔드포인트
// app.post('/send-bulk-notification', async (req, res) => {
//     try {
//         await sendNotifications();
//         res.status(200).send('Bulk notification sent successfully');
//     } catch (error) {
//         console.error('Error sending bulk notification:', error);
//         res.status(500).send('Failed to send bulk notification');
//     }
// });
//
// // 서버 실행
// const PORT = 3000;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });
