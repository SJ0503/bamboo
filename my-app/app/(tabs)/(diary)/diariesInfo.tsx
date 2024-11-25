import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserInfo } from '../../../storage/storageHelper';
import { serverAddress } from '../../../components/Config';
export interface Diary {
    diaryIdx: number;
    userEmail: string;
    emotionTag: string;
    diaryContent: string;
    createdAt: string;
    diaryWeather: string;
    diaryPhoto: string | null;
}

interface DiaryScreenProps {
    onEntriesLoaded: (entries: Diary[]) => void; // index.tsx로 데이터 전달 콜백
}

const DiaryScreen: React.FC<DiaryScreenProps> = ({ onEntriesLoaded }) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [userEmail, setUserEmail] = useState<string | null>(null);

    const fetchUserEmail = async () => {
        const userInfo = await getUserInfo(); // 사용자 정보 가져오기
        if (userInfo) {
            setUserEmail(userInfo.userEmail); // 사용자 이메일 설정
            // console.log('Fetched email from userInfo:', userInfo.userEmail);
        } else {
            console.error('No userInfo found in AsyncStorage');
        }
    };

    const fetchDiaryEntries = async () => {
        if (!userEmail) return; // userEmail이 없으면 반환
        setLoading(true); // 로딩 시작
        try {
            const response = await fetch(`${ serverAddress }/api/diaries/user_diaries?userEmail=${userEmail}`);
            // console.log(`Response status: ${response.status}`); // 응답 상태 로그

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: Diary[] = await response.json(); // JSON 데이터 파싱
            // console.log('Data fetched:', data); // 로드한 데이터 출력

            if (Array.isArray(data)) {
                onEntriesLoaded(data); // 데이터 전달
            } else {
                console.error('Received data is not an array:', data);
            }
        } catch (error) {
            console.error('Failed to fetch diary entries:', error); // 에러 출력
        } finally {
            setLoading(false); // 로딩 종료
        }
    };

    // 컴포넌트가 처음 렌더링될 때 사용자 정보를 가져옴
    useEffect(() => {
        fetchUserEmail(); // 이메일 가져오기
    }, []);

    useEffect(() => {
        if (userEmail) {
            fetchDiaryEntries(); // 이메일이 설정되면 다이어리 항목 가져오기
        }
    }, [userEmail]);

    return null; // 데이터 처리만 하고 UI는 상위 컴포넌트에서 처리
};
export default DiaryScreen;
