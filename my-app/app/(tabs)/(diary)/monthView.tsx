import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { serverAddress } from '../../../components/Config';

// 일기 항목 인터페이스 정의
interface DiaryEntry {
  diary_idx: number;
  user_email: string;
  emotion_tag: string;
  diary_content: string;
  diary_weather: string;
  diary_photo: string | null;
  diary_date: string; // diary_date 필드 사용
}

export default function MonthView() {
  const { year: initialYear, month: initialMonth } = useLocalSearchParams<{ year: string; month: string }>();

  const [year, setYear] = useState(parseInt(initialYear));
  const [month, setMonth] = useState(parseInt(initialMonth));
  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // 감정 및 날씨 이미지 매핑
  const emotionImages = {
    happy: require("../../../assets/images/diary_happy.png"),
    sad: require("../../../assets/images/diary_sad.png"),
    neutral: require("../../../assets/images/diary_neutral.png"),
    angry: require("../../../assets/images/diary_angry.png"),
    surprise: require("../../../assets/images/diary_surprise.png"),
    fear: require("../../../assets/images/diary_fear.png"),
    dislike: require("../../../assets/images/diary_dislike.png"),
  };
  const weatherImages = {
    sunny: require("../../../assets/images/diary_맑음.png"),
    cloudy: require("../../../assets/images/diary_구름.png"),
    rainy: require("../../../assets/images/diary_비.png"),
    snowy: require("../../../assets/images/diary_눈.png"),
    thunderstorm: require("../../../assets/images/diary_천둥번개.png"),
  };

  useEffect(() => {
    fetchMonthDiaries();
  }, [year, month]);

  const fetchMonthDiaries = async () => {
    try {
      setLoading(true);

      const storedUserInfo = await AsyncStorage.getItem("userInfo");
      const userData = storedUserInfo ? JSON.parse(storedUserInfo) : null;

      if (!userData) {
        Alert.alert("알림", "사용자 정보가 없습니다.");
        return;
      }

      const response = await axios.get(`${serverAddress}/api/diaries/month`, {
        params: {
          userEmail: userData.userEmail,
          year: year,
          month: month,
        },
      });

      console.log("API Response:", response.data); // API 응답 확인용 로그

      if (Array.isArray(response.data)) {
        const formattedData = response.data.map((entry) => {
          let parsedPhotos = [];
          if (typeof entry.diaryPhoto === "string" && entry.diaryPhoto.trim() !== "") {
            try {
              parsedPhotos = JSON.parse(entry.diaryPhoto);
            } catch (error) {
              console.error("Error parsing diaryPhoto JSON:", error);
              parsedPhotos = [];
            }
          }

          return {
            ...entry,
            diary_photo: parsedPhotos, // diaryPhoto를 diary_photo로 매핑
            emotion_tag: entry.emotionTag, // emotionTag를 emotion_tag로 매핑
            diary_content: entry.diaryContent, // diaryContent를 diary_content로 매핑
            diary_date: entry.diaryDate || "날짜 없음", // diaryDate를 diary_date로 매핑
          };
        });

        console.log("Formatted Data:", formattedData); // 매핑된 데이터 확인
        setDiaries(formattedData);
      } else {
        console.warn("응답 데이터가 예상 형식이 아닙니다.");
        setDiaries([]);
      }
    } catch (error) {
      console.error("데이터 로드 실패:", error);
      Alert.alert("오류", "데이터를 가져오는 중 문제가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };



  // 달 변경 함수 (이전 또는 다음 달로 이동)
    const changeMonth = (direction: 'prev' | 'next') => {
      if (direction === 'prev') {
        if (month === 1) {
          setYear(year - 1);  // 1월에서 이전 달로 가면 연도를 줄이고 12월로 설정
          setMonth(12);
        } else {
          setMonth(month - 1); // 그 외의 경우 월을 1 감소
        }
      } else if (direction === 'next') {
        if (month === 12) {
          setYear(year + 1);  // 12월에서 다음 달로 가면 연도를 늘리고 1월로 설정
          setMonth(1);
        } else {
          setMonth(month + 1); // 그 외의 경우 월을 1 증가
        }
      }
    };

  // 날짜 포맷팅 함수에서 diaryDate를 사용하도록 업데이트
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "날짜 없음"; // null 또는 undefined 처리

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "날짜 오류"; // 잘못된 날짜 형식 처리

    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  // 개별 일기 항목 렌더링 함수
  const renderDiaryItem = ({ item }: { item: DiaryEntry }) => {
    return (
      <TouchableOpacity
        style={styles.diaryItem}
        onPress={() =>
          router.push({
            pathname: "/(diary)/diaryView",
            params: { date: item.diary_date || "" },
          })
        }
      >
        <View style={styles.diaryContainer}>
          <View style={styles.emotionContainer}>
            <Image
              source={emotionImages[item.emotion_tag]}
              style={styles.emotionImage}
            />
          </View>
          <View style={styles.rightContainer}>
            <View style={styles.headerContainer}>
              <Text style={styles.dateText}>{formatDate(item.diary_date)}</Text>
              <Image
                source={weatherImages[item.diary_weather]}
                style={styles.weatherImage}
              />
            </View>
            <View style={styles.contentContainer}>
              <Text style={styles.contentText} numberOfLines={2}>
                {item.diary_content}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => changeMonth('prev')} style={styles.iconButton}>
          <Ionicons name="chevron-back-circle-outline" size={23} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>{year}년 {month}월</Text>
        <TouchableOpacity onPress={() => changeMonth('next')} style={styles.iconButton}>
          <Ionicons name="chevron-forward-circle-outline" size={23} color="#333" />
        </TouchableOpacity>
      </View>
      {loading ? (
        <View style={styles.centerContainer}>
          <Text>로딩 중...</Text>
        </View>
      ) : diaries.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text>이번 달 작성된 일기가 없습니다.</Text>
        </View>
      ) : (
        <FlatList
            data={diaries}
            renderItem={renderDiaryItem}
            keyExtractor={(item, index) => item.diaryIdx ? item.diaryIdx.toString() : index.toString()}
            contentContainerStyle={styles.listContainer}
          />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    position: 'absolute',
    left: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 3,
    lineHeight: 30,
  },
  iconButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    padding: 1,
  },
  diaryItem: {
    backgroundColor: '#f9f9f9f9',
    borderRadius: 20,
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.2,
//     shadowRadius: 1,
  },
  diaryContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  emotionContainer: {
    marginRight: 15,
    borderRightWidth: 1,
    borderRightColor: '#eee',
    paddingRight: 15,
    width: 90,
  },
  emotionImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  rightContainer: {
    flex: 1,
    width: '100%',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  weatherImage: {
    width: 24,
    height: 24,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    width: '100%',
    paddingRight: 0,
  },
  contentText: {
    flex: 1,
    fontSize: 14,
    marginRight: 0,
  },
  photoThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 5,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

//