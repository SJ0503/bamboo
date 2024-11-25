import React, { useState, useMemo, useEffect, useCallback  } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { getChatHistory } from '../../components/getChatHistory';
import useServerImage from '../../components/getWordCloud';
import { getUserInfo } from '../../storage/storageHelper';
import EmotionIcon from '../../components/EmotionIcon';
import EmotionChart from '../../components/EmotionChart';
import EmotionChartLine from '../../components/EmotionChartLine';
import EmotionStackChart from '../../components/EmotionStackChart';
import WordCloud from '../../components/WordCloud';
import { useFocusEffect } from '@react-navigation/native';
import { LogBox } from 'react-native';

import em_happy from "../../assets/images/기쁨.png";
import em_angry from "../../assets/images/화남.png";
import em_surprise from "../../assets/images/놀람.png";
import em_fear from "../../assets/images/두려움.png";
import em_sad from "../../assets/images/슬픔.png";
import em_dislike from "../../assets/images/혐오.png";
import em_soso from "../../assets/images/쏘쏘.png";

export interface EmotionTag {
    emotionTag: string;
}
// LogBox 경고 숨기기
// LogBox.ignoreAllLogs();

// 모든 console 메서드 덮어쓰기
// console.log = () => {};
// console.warn = () => {};
// console.error = () => {};
// 최근 7일의 날짜 라벨 생성 함수
const getLast7DaysLabels = () => {
    const labels = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
        const day = new Date(today);
        day.setDate(today.getDate() - i);
        labels.unshift(`${String(day.getDate()).padStart(2, '0')}일`);
    }
    return labels;
};

// 초기 차트 데이터 (기본값 설정)
const initialChartData = {
    labels: getLast7DaysLabels(),
    datasets: [
        { data: Array(7).fill(0), color: () => "#009944", label: "공포" },
        { data: Array(7).fill(0), color: () => "#00A0E9", label: "놀람" },
        { data: Array(7).fill(0), color: () => "#E50012", label: "분노" },
        { data: Array(7).fill(0), color: () => "#8800FF", label: "슬픔" },
        { data: Array(7).fill(0), color: () => "#575554", label: "중립" },
        { data: Array(7).fill(0), color: () => "#E4D354", label: "행복" },
        { data: Array(7).fill(0), color: () => "#EF8BB6", label: "혐오" }
    ]
};

const Report = () => {
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();
    const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
    const [chartData, setChartData] = useState(initialChartData); // 기본값으로 설정
    const [originalEmotionDataByDay, setOriginalEmotionDataByDay] = useState({});
    const [emotionDataByDay, setEmotionDataByDay] = useState({});
    const [userNick, setUserNick] = useState<string | null>(null);
    const [isDataLoaded, setIsDataLoaded] = useState(false); // 로딩 상태 추가
    const imageData = useServerImage() || ""; // 기본 빈 문자열로 설정

    // 감정별 아이콘
    const emotionIcon = [
        { key: "공포", label: "공포", icon: em_fear },
        { key: "놀람", label: "놀람", icon: em_surprise },
        { key: "분노", label: "분노", icon: em_angry },
        { key: "슬픔", label: "슬픔", icon: em_sad },
        { key: "중립", label: "중립", icon: em_soso },
        { key: "행복", label: "행복", icon: em_happy },
        { key: "혐오", label: "혐오", icon: em_dislike },
    ];

    const aspectRatio = screenWidth / screenHeight;

    // 페이지가 포커스될 때 데이터를 다시 로드
    useFocusEffect(
        useCallback(() => {
            loadChatHistory();
            const fetchUserInfo = async () => {
                try {
                    const userInfo = await getUserInfo();
                    setUserNick(userInfo?.userNick || '사용자');
                } catch (error) {
                    console.error("Failed to fetch user info:", error);
                }
            };
            fetchUserInfo();
        }, [])
    );

    const loadChatHistory = async () => {
        try {
            const chatHistory = await getChatHistory() || []; // 데이터가 없으면 빈 배열로 설정

            if (!Array.isArray(chatHistory) || chatHistory.length === 0) {
                console.warn("No chat history data available"); // 데이터가 없을 때 경고 로그
                setIsDataLoaded(true); // 데이터가 없더라도 `isDataLoaded`를 true로 설정하여 컴포넌트가 렌더링되도록 함
                return;
            }

            const today = new Date();
            today.setDate(today.getDate());
            today.setUTCHours(23, 59, 59, 999);

            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(today.getDate() - 6);
            sevenDaysAgo.setUTCHours(0, 0, 0, 0);

            const emotionDataByDayTemp = {
                공포: Array(7).fill(0),
                놀람: Array(7).fill(0),
                분노: Array(7).fill(0),
                슬픔: Array(7).fill(0),
                중립: Array(7).fill(0),
                행복: Array(7).fill(0),
                혐오: Array(7).fill(0)
            };
            const originalEmotionDataByDayTemp = JSON.parse(JSON.stringify(emotionDataByDayTemp));
            const emotionCountsByDay = Array(7).fill(0);
            const emotionSumsByDay = Array(7).fill(0);

            const processedChatIds = new Set();

            chatHistory.forEach((chat, index) => {

                if (chat.chatter === "user" && !processedChatIds.has(chat.chatIdx)) {
                    const chatDate = new Date(chat.createdAt);
                    const localChatDate = new Date(chatDate.getTime() - (chatDate.getTimezoneOffset() * 60000));

                    if (localChatDate >= sevenDaysAgo && localChatDate <= today) {
                        const dayIndex = Math.floor((localChatDate.getTime() - sevenDaysAgo.getTime()) / (1000 * 60 * 60 * 24));

                        if (chat.emotionTag) {
                            try {
                                const parsedEmotionTag = JSON.parse(chat.emotionTag);

                                for (const [emotion, value] of Object.entries(parsedEmotionTag)) {
                                    if (emotionDataByDayTemp[emotion]) {
                                        originalEmotionDataByDayTemp[emotion][dayIndex] += value;
                                        emotionCountsByDay[dayIndex] += 1;
                                        emotionDataByDayTemp[emotion][dayIndex] += value;
                                        emotionSumsByDay[dayIndex] += value;
                                    }
                                }
                                processedChatIds.add(chat.chatIdx);
                            } catch (error) {
                                console.error("Failed to parse emotionTag:", error, chat.emotionTag); // 에러 발생 시 로그 추가
                            }
                        } else {
                            console.warn("Missing emotionTag in chat:", chat); // emotionTag가 없을 경우 경고
                        }
                    }
                }
            });


            for (const emotion in originalEmotionDataByDayTemp) {
                for (let i = 0; i < 7; i++) {
                    if (emotionCountsByDay[i] > 0) {
                        originalEmotionDataByDayTemp[emotion][i] = parseFloat(
                            (originalEmotionDataByDayTemp[emotion][i] / emotionCountsByDay[i]).toFixed(4)
                        );
                    } else {
                        originalEmotionDataByDayTemp[emotion][i] = 0;
                    }
                }
            }

            for (const emotion in emotionDataByDayTemp) {
                for (let i = 0; i < 7; i++) {
                    if (emotionSumsByDay[i] > 0) {
                        emotionDataByDayTemp[emotion][i] = parseFloat(
                            (emotionDataByDayTemp[emotion][i] / emotionSumsByDay[i]).toFixed(4)
                        );
                    } else {
                        emotionDataByDayTemp[emotion][i] = 0;
                    }
                }
            }

            setOriginalEmotionDataByDay(originalEmotionDataByDayTemp);
            setEmotionDataByDay(emotionDataByDayTemp);
            setIsDataLoaded(true);
        } catch (error) {
            console.error("Failed to load chat history:", error);
        }
    };


    const toggleEmotion = (emotion: string) => {
        setSelectedEmotions((prevSelected) =>
            prevSelected.includes(emotion)
                ? prevSelected.filter((e) => e !== emotion)
                : [...prevSelected, emotion]
        );
    };

    const normalizedEmotionDataByDay = useMemo(() => {
        const allEmotionValues = Object.values(originalEmotionDataByDay || {}).flat();
        const maxEmotionValue = Math.max(...allEmotionValues) || 1;

        const normalizedData: { [key: string]: number[] } = {};
        for (const [emotion, values] of Object.entries(originalEmotionDataByDay || {})) {
            normalizedData[emotion] = values.map((value) => Math.min(value / maxEmotionValue, 1));
        }

        return normalizedData;
    }, [originalEmotionDataByDay]);


    const filteredData = useMemo(() => {
        return initialChartData.datasets.filter((dataset) =>
            selectedEmotions.includes(dataset.label)
        );
    }, [selectedEmotions]);

    return (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.container}>
                <View style={styles.sectionContainer}>
                    <Text style={styles.title}>{userNick}의 감정 상태</Text>
                </View>

                <View style={[styles.sectionContainer,{alignItems:'center',justifyContent: 'center'}]}>
                    <Text style={styles.subtitle}>감정 선택</Text>
                    <EmotionIcon
                        emotionIcon={emotionIcon}
                        toggleEmotion={toggleEmotion}
                        selectedEmotions={selectedEmotions}
                        iconSize={30}
                        iconMargin={-4} // 원하는 간격 값
                    />

                </View>

                {isDataLoaded && normalizedEmotionDataByDay && Object.keys(normalizedEmotionDataByDay).length > 0 && (
                    <>
                        <View style={[styles.sectionContainer,{height:screenHeight*0.3}]}>
                            <Text style={styles.subtitle}>감정 라인 그래프</Text>
                            <EmotionChart
                                selectedEmotions={selectedEmotions}
                                chartData={chartData}
                                normalizedEmotionDataByDay={normalizedEmotionDataByDay}
                            />
                            <View style={[styles.sectioninner,{top:-screenHeight*0.24}]}>
                                <EmotionChartLine
                                    selectedEmotions={selectedEmotions}
                                    chartData={chartData}
                                    normalizedEmotionDataByDay={normalizedEmotionDataByDay}
                                />
                            </View>

                        </View>


                        <View style={[styles.sectionContainer,{height:screenHeight*0.3}]}>
                            <Text style={styles.subtitle}>감정 스택 그래프</Text>
                            <EmotionStackChart
                                selectedEmotions={selectedEmotions}
                                chartData={chartData}
                                emotionDataByDay={emotionDataByDay}
                            />
                        </View>
                    </>
                )}

                <View style={styles.sectionContainer}>
                    <Text style={styles.subtitle}>워드클라우드</Text>
                    <WordCloud imageData={imageData} />
                </View>
            </View>
        </ScrollView>
    );
};

export default Report; // 중복된 export default를 제거하고 이 부분에서만 EmotionReport를 export합니다.

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: '#FFFFFF',
    },
    sectionContainer: {
        backgroundColor: '#f9f9f9',
        borderRadius: 20,
        padding: 10,
        marginVertical: 8,
        marginHorizontal: 5,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.2,
//     shadowRadius: 1,
//     borderWidth: 1,
        borderColor: '#eee',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        marginBottom: 10,
    },
    sectioninner: {
        bottom:247,
    },
});
