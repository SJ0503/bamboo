import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, Animated } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import SmoothCurvedButton from '../../../components/SmoothCurvedButton';

export default function MoodSelectionScreen() {
  const { date } = useLocalSearchParams();
  const router = useRouter();

  const [selectedWeather, setSelectedWeather] = useState(null);
  const [selectedMood, setSelectedMood] = useState(null);
  const [errorMessage, setErrorMessage] = useState(""); // 오류 메시지 상태
  const fadeAnim = useState(new Animated.Value(0))[0]; // 페이드 애니메이션

  const moodOptions = [
    { id: "happy", image: require("../../../assets/images/diary_happy.png") },
    { id: "neutral", image: require("../../../assets/images/diary_neutral.png") },
    { id: "sad", image: require("../../../assets/images/diary_sad.png") },
    { id: "angry", image: require("../../../assets/images/diary_angry.png") },
    { id: "surprise", image: require("../../../assets/images/diary_surprise.png") },
    { id: "fear", image: require("../../../assets/images/diary_fear.png") },
    { id: "dislike", image: require("../../../assets/images/diary_dislike.png") },
  ];

  const weatherOptions = [
    { id: "sunny", image: require("../../../assets/images/diary_맑음.png") },
    { id: "cloudy", image: require("../../../assets/images/diary_구름.png") },
    { id: "rainy", image: require("../../../assets/images/diary_비.png") },
    { id: "snowy", image: require("../../../assets/images/diary_눈.png") },
    { id: "thunderstorm", image: require("../../../assets/images/diary_천둥번개.png") },
  ];

  const formatDate = (dateString) => {
    const dateObj = new Date(dateString);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const daysOfWeek = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
    const dayOfWeek = daysOfWeek[dateObj.getDay()];
    return `${year}.${month}.${day} ${dayOfWeek}`;
  };

  const showErrorMessage = (message) => {
      setErrorMessage(message);

      // 페이드 인 애니메이션
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // 3초 후에 페이드 아웃 및 메시지 초기화
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setErrorMessage(""));
      }, 3000);
    };

    const handleSelectionComplete = () => {
      // 기분과 날씨가 모두 선택되었는지 확인
      if (!selectedMood || !selectedWeather) {
        showErrorMessage("오늘 기분과 날씨를 선택해주세요");
        return;
      }

     // 선택이 완료된 경우에만 다음 화면으로 이동
    router.push({
      pathname: "/(diary)/write",
      params: {
        date,
        weather: selectedWeather,
        mood: selectedMood,
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>{formatDate(date)}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={[styles.subtitle, styles.moodText]}>오늘 하루, 어떤 기분으로 채워졌나요?</Text>
        <FlatList
          data={moodOptions}
          numColumns={4}// 두 줄로 설정
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => setSelectedMood(item.id)}
            >
              <Image
                source={item.image}
                style={[
                  styles.moodImage,
                  { opacity: selectedMood === item.id ? 1 : 0.3 },
                ]}
              />
            </TouchableOpacity>
          )}
            contentContainerStyle={{ alignItems: "center" }} // 전체 내용 가운데 정렬
        />
      </View>

      <View style={[styles.sectionContainer,{alignItems:'center', justifyContent:'center'}]}>
        <Text style={styles.subtitle}>오늘의 날씨</Text>
        <FlatList
          data={weatherOptions}
          horizontal
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => setSelectedWeather(item.id)}
            >
              <Image
                source={item.image}
                style={[
                  styles.weatherImage,
                  { opacity: selectedWeather === item.id ? 1 : 0.3 },
                ]}
              />
            </TouchableOpacity>
          )}
        />
      </View>
          <View style={styles.completeButtonContainer}>
            <SmoothCurvedButton onPress={handleSelectionComplete} style={styles.completeButton} title={'다음'} />
          </View>

    {/* 하단 텍스트 알림 메시지 */}
      {errorMessage ? (
        <Animated.View style={[styles.alertBox, { opacity: fadeAnim }]}>
            <Image
                   source={require("../../../assets/images/기쁨.png")}
                   style={styles.icon}
            />
         <Text style={styles.alertText}>{errorMessage}</Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#ffffff",
    borderRadius: 10,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: 25,
  },
  title: {
    fontSize: 17,
    fontWeight: "bold",
    textAlign: "center",
  },
  backButton: {
    position: "absolute",
    left: 0,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 17,
  },
  moodText: {
    textAlign: "center",
  },
  moodImage: {
    width: 60,
    height: 60,
    marginRight: 8,
    resizeMode: "contain",
  },
  sectionContainer: {
    marginBottom: 15,
    padding: 10,
    borderRadius: 20,
    backgroundColor: "#f9f9f9",
  },
  optionButton: {
    padding: 5,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  weatherImage: {
    width: 50,
    height: 50,
    marginRight: 8,
    resizeMode: "contain",
  },
  completeButtonContainer: {
    alignItems: 'center',  // 버튼을 수평 중앙 정렬
    marginTop: 20,         // 상단 여백 조정 (필요에 따라 조절)
  },
  alertBox: {
    flexDirection: "row",
    position: "absolute", // 절대 위치 설정
    bottom: 70,           // 화면 하단에서 50포인트 위에 배치
    alignSelf: "stretch", // 부모 컨테이너의 너비를 따름
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 100,
  },
  icon: {
      width: 25, // 아이콘 너비
      height: 25, // 아이콘 높이
      marginRight: 8, // 텍스트와 간격
      resizeMode: "contain",
    },
  alertText: {
    color: "#000",
    fontSize: 14,
  },
});