import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, Platform, Alert, KeyboardAvoidingView, ScrollView, TouchableOpacity,TouchableWithoutFeedback, Keyboard,useWindowDimensions } from "react-native";
import { useLocalSearchParams, router } from 'expo-router';
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserInfo } from '../../../storage/storageHelper';
import { serverAddress } from '../../../components/Config';
import Ionicons from 'react-native-vector-icons/Ionicons';

// 감정 이미지 경로를 매핑한 객체
const moodImageMap = {
  happy: require("../../../assets/images/diary_happy.png"),
  neutral: require("../../../assets/images/diary_neutral.png"),
  sad: require("../../../assets/images/diary_sad.png"),
  angry: require("../../../assets/images/diary_angry.png"),
  surprise: require("../../../assets/images/diary_surprise.png"),
  fear: require("../../../assets/images/diary_fear.png"),
  dislike: require("../../../assets/images/diary_dislike.png"),
};

// 날씨 이미지 경로를 매핑한 객체
const weatherImageMap = {
  sunny: require("../../../assets/images/diary_맑음.png"),
  cloudy: require("../../../assets/images/diary_구름.png"),
  rainy: require("../../../assets/images/diary_비.png"),
  snowy: require("../../../assets/images/diary_눈.png"),
  thunderstorm: require("../../../assets/images/diary_천둥번개.png"),
};

export default function DiaryScreen() {
  const { date } = useLocalSearchParams();
  const [entryText, setEntryText] = useState("");
  const [diaryPhotoUrls, setDiaryPhotoUrls] = useState([]);
  const [mood, setMood] = useState("");
  const [weather, setWeather] = useState("");
  const [day, setDay] = useState("");
  const {width, height} = useWindowDimensions("");

  useEffect(() => {
    const fetchDiaryData = async () => {
      const formattedDate = new Date(date).toISOString().split("T")[0];
      const dayOfWeek = new Date(date).toLocaleDateString("ko-KR", { weekday: "long" });
      setDay(dayOfWeek);

      try {
        const userInfo = await getUserInfo();
        if (!userInfo || !userInfo.userEmail) {
          throw new Error("사용자 이메일이 존재하지 않습니다.");
        }

        const response = await axios.get(`${serverAddress}/api/diaries/user_diaries`, {
          params: { userEmail: userInfo.userEmail },
        });

        const data = response.data;
        const selectedDateData = data.find((entry) => entry.diaryDate === formattedDate);

        if (selectedDateData) {
          setEntryText(selectedDateData.diaryContent);
          setMood(selectedDateData.emotionTag);
          setWeather(selectedDateData.diaryWeather);

          // diaryPhoto에서 URL 배열 처리
          const diaryPhoto = selectedDateData.diaryPhoto;
                  if (diaryPhoto) {
                    try {
                      // diaryPhoto가 JSON 문자열로 저장된 경우 배열로 변환
                      const imageUrls = JSON.parse(diaryPhoto);
                      if (Array.isArray(imageUrls)) {
                        setDiaryPhotoUrls(imageUrls); // 변환된 배열 설정
                      } else {
                        setDiaryPhotoUrls([]); // 결과가 배열이 아닌 경우 빈 배열 설정
                      }
                    } catch (error) {
                      console.error("diaryPhoto 파싱 오류:", error);
                      setDiaryPhotoUrls([]); // JSON 파싱 실패 시 빈 배열 설정
                    }
                  } else {
                    setDiaryPhotoUrls([]); // diaryPhoto가 없는 경우 빈 배열 설정
                  }
                } else {
                  // 데이터가 없을 경우 초기화
                  setEntryText("");
                  setMood("");
                  setWeather("");
                  setDiaryPhotoUrls([]);
                  Alert.alert("알림", `${formattedDate}에 해당하는 일기 데이터가 없습니다.`);
                }
              } catch (error) {
                console.error("일기 데이터를 가져오는 데 오류가 발생했습니다:", error);
                Alert.alert("오류", "일기 데이터를 불러오는 중 문제가 발생했습니다.");
              }
            };

            fetchDiaryData();
          }, [date]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, {}]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={[styles.scrollContainer]}>
          <View style={[styles.topContainer, { alignItems: "center", justifyContent: "center" }]}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color="#333" />
            </TouchableOpacity>
            <View style={styles.moodImageContainer}>
              {mood && <Image source={moodImageMap[mood]} style={styles.moodImage} />}
            </View>
            <View style={styles.dateDisplayContainer}>
              <Text style={styles.dateText}>{date}</Text>
              <View style={styles.dayAndWeatherContainer}>
                <Text style={styles.dayText}>{day}</Text>
                {weatherImageMap[weather] && (
                  <Image
                    key={weather}
                    source={weatherImageMap[weather]}
                    style={styles.weatherImage}
                  />
                )}
              </View>
            </View>
          </View>

          <View style={styles.entryContainer}>
            <View style={styles.imageContainer}>
              {diaryPhotoUrls.length === 0 ? (
                <Text style={styles.noPhotosText}></Text>
              ) : (
                diaryPhotoUrls.map((url, index) => (
                  <Image
                    key={index}
                    source={{ uri: `${url}?${new Date().getTime()}` }}
                    style={styles.image}
                    onError={(error) => {
                      console.error(`이미지 로드 오류: ${url}`, error.nativeEvent);
                      Alert.alert("이미지 오류", `이미지를 불러올 수 없습니다: ${url}`);
                    }}
                  />
                ))
              )}
            </View>
            <Text style={styles.entryText}>{entryText || "일기 내용이 없습니다."}</Text>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#ffffff" },
  scrollContainer: { paddingBottom: 20 },
  topContainer: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  moodImageContainer: { padding: 5, marginRight: 10, alignItems: "center", justifyContent: "center" },
  moodImage: { width: 80, height: 80, resizeMode: "contain" },
  dateDisplayContainer: { alignItems: "center", marginVertical: 20 },
  dateText: { fontSize: 20, fontWeight: "bold" },
  dayAndWeatherContainer: { flexDirection: "row", alignItems: "center", justifyContent: "flex-start", marginTop: 10 },
  dayText: { fontSize: 15, color: "#888888" },
  weatherImage: { width: 30, height: 30, resizeMode: "contain", marginLeft: 10 },
  entryContainer: { padding: 15, backgroundColor: "#f9f9f9", borderRadius: 10, marginTop: 10, minHeight: 400 },
  entryText: { fontSize: 16, lineHeight: 24, textAlignVertical: "top" },

  // 이미지 컨테이너
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between', // 두 개씩 배치
    paddingVertical: 10,  // 상하 간격 추가
  },

  // 개별 이미지 스타일
  image: {
    width: '48%',  // 한 줄에 두 개씩 배치
    height: 150,
    marginBottom: 10, // 아래 여백
    marginHorizontal: '1%',  // 좌우 여백 추가로 정돈된 배치
    borderRadius: 15,  // 사진 모서리 둥글게
    borderWidth: 1, // 테두리 추가
    borderColor: '#ddd',  // 테두리 색상
    shadowColor: '#000', // 그림자 색상
    shadowOffset: { width: 0, height: 2 }, // 그림자 오프셋
    shadowOpacity: 0.1, // 그림자 투명도
    shadowRadius: 5, // 그림자 반경
    elevation: 3, // 안드로이드에서 그림자 효과
  },

  // 사진이 없을 때 텍스트 스타일
  noPhotosText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'gray',
    marginTop: 20, // 텍스트와 이미지 간 여백 추가
  },

  backButton: {
    padding: 8,
    marginRight: 8,
    position: 'absolute',
    left: 16,
  },
});
