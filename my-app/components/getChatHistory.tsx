import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {serverAddress} from './Config';

export interface ChatMessage {
    chatIdx: number;
    croomIdx: number;
    chatter: string;
    chatContent: string;
    chatEmoticon?: string;
    chatFile?: string;
    createdAt: string;
    emotionTag?: string;
    sessionIdx: number;
    evaluation: string;
}

/**
 * 서버로부터 채팅 내역을 가져오는 함수
 * @returns 채팅 내역 데이터 배열
 */
export const getChatHistory = async (): Promise<ChatMessage[]> => {
    try {
        // AsyncStorage에서 croomIdx를 가져오기
        const storedCroomIdx = await AsyncStorage.getItem("croomIdx");
        if (!storedCroomIdx) {
            throw new Error("croomIdx not found in AsyncStorage");
        }

        const croomIdx = parseInt(storedCroomIdx, 10); // 가져온 값을 숫자로 변환

        // 서버에 요청
        const response = await axios.get(`${serverAddress}/api/chat/getChatHistory`, {
            params: { croomIdx },
        });

        const chatHistory: ChatMessage[] = response.data; // 서버로부터 받은 데이터

        // 채팅 내용을 `[LB]` 기준으로 분리
        const formattedChatHistory: ChatMessage[] = [];
        chatHistory.forEach(chat => {
            const splitMessages = chat.chatContent.split("[LB]").map(msg => msg.trim()).filter(Boolean);

            splitMessages.forEach((splitMsg, index) => {
                formattedChatHistory.push({
                    ...chat, // 기존의 모든 필드 복사
                    chatContent: splitMsg, // 나눠진 메시지로 대체
                    chatIdx: `${chat.chatIdx}` as unknown as number, // 중복 방지를 위해 chatIdx에 index 추가
                });
            });
        });

        return formattedChatHistory; // 분리된 메시지 배열 반환
    } catch (error) {
        // console.error("Error fetching chat history:", error);
        throw error;
    }
};
