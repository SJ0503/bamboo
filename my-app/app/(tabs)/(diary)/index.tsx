import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, Animated, useWindowDimensions } from "react-native";
import { Ionicons, Foundation } from "@expo/vector-icons";
import { router } from "expo-router";
import DateModal from "../(diary)/dateModal";
import DiaryScreen, { Diary } from "@/app/(tabs)/(diary)/diariesInfo";
import { useFocusEffect } from "@react-navigation/native";

interface DiaryEntry {
  diaryIdx: number;
  diaryDate: string;
  emotionTag: string;
}


const Day = React.memo(
    ({ date, today, currentMonth, currentYear, handleDayPress, emotion }) => {
      const { width: screenWidth, height:screenHeight } = useWindowDimensions(); // 화면 너비 가져오기
      const isToday =
          date.day === today.getDate() &&
          currentMonth === today.getMonth() &&
          currentYear === today.getFullYear();

      const moodImageMap = {
        happy: require("../../../assets/images/diary_happy.png"),
        sad: require("../../../assets/images/diary_sad.png"),
        neutral: require("../../../assets/images/diary_neutral.png"),
        angry: require("../../../assets/images/diary_angry.png"),
        surprise: require("../../../assets/images/diary_surprise.png"),
        fear: require("../../../assets/images/diary_fear.png"),
        dislike: require("../../../assets/images/diary_dislike.png"),
      };
      const emotionImage = emotion ? moodImageMap[emotion] : null;
      return (
          <TouchableOpacity
            style={[
              styles.dateContainer,
              date.outsideMonth && styles.outsideMonth,
              { width: screenWidth / 8 }, // 화면 너비를 7등분하여 설정
            ]}
            onPress={() => handleDayPress(date.day)}
          >

            <View style={[styles.circle, isToday && styles.todayCircle]}>
              {emotionImage ? (
                  <Image source={emotionImage} style={styles.emotionImage} />
              ) : (
                  <Text style={[styles.dateText, isToday && styles.todayText]}>
                  </Text>
              )}
            </View>
            <Text style={[styles.dateText, isToday && styles.todayText]}>
              {date.day}
            </Text>
          </TouchableOpacity>
      );
    }
);

export default function CustomDiaryScreen() {
  const [diaryEntries, setDiaryEntries] = useState<Diary[]>([]);
  const [selectedDates, setSelectedDates] = useState<Record<string, string>>({});
  const alertOpacity = useRef(new Animated.Value(0)).current;
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const handleEntriesLoaded = (entries: Diary[]) => {
    setDiaryEntries(entries);

    const datesMap: Record<string, string> = {};
    entries.forEach((entry) => {
      const date = new Date(entry.diaryDate);
      const dateKey = date.toISOString().split("T")[0];
      datesMap[dateKey] = entry.emotionTag;
    });

    setSelectedDates(datesMap);
  };

  useFocusEffect(
      useCallback(() => {
        // 화면이 포커스될 때 DiaryScreen의 데이터를 로드
        <DiaryScreen onEntriesLoaded={handleEntriesLoaded} />;
      }, [])
  );

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [modalVisible, setModalVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  let alertTimeout;

  const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];

  // getDaysInMonth 함수에서 없는 날짜에 invisible 속성 추가
  const getDaysInMonth = (year, month) => {
      const firstDayOfMonth = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0).getDate();
      const firstDayOfWeek = firstDayOfMonth.getDay();
      const prevMonthLastDay = new Date(year, month, 0).getDate();

      const days = [];

      // 이전 달의 마지막 주에 해당하는 날짜 추가
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
          days.push({ day: prevMonthLastDay - i, outsideMonth: true, invisible: true });
      }

      // 현재 달의 날짜 추가
      for (let day = 1; day <= lastDay; day++) {
          days.push({ day, outsideMonth: false, invisible: false });
      }

      // 다음 달의 시작 부분에 해당하는 날짜 추가
      const remainingDays = 7 - (days.length % 7);
      if (remainingDays < 7) {
          for (let i = 1; i <= remainingDays; i++) {
              days.push({ day: i, outsideMonth: true, invisible: true });
          }
      }

      return days;
  };

  const showAlertMessage = (message) => {
    setAlertMessage(message);
    Animated.timing(alertOpacity, {
      toValue: 1, // fully visible
      duration: 300, // fade in duration
      useNativeDriver: true,
    }).start();

    alertTimeout = setTimeout(() => {
      Animated.timing(alertOpacity, {
        toValue: 0, // fully invisible
        duration: 300, // fade out duration
        useNativeDriver: true,
      }).start(() => setAlertMessage("")); // clear message after fade out
    }, 3000); // show alert for 3 seconds
  };

  const handleDayPress = (day) => {
    const selectedDate = new Date(currentYear, currentMonth, day);
    const dateKey = `${currentYear}-${(currentMonth + 1)
        .toString()
        .padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

    if (selectedDate > today) {
      clearTimeout(alertTimeout);
      showAlertMessage("앗, 미래 날짜는 아직 기록할 수 없어요!");
      return;
    }

    clearTimeout(alertTimeout);

    if (selectedDates[dateKey]) {
      router.push({
        pathname: "/(diary)/diaryView",
        params: { date: dateKey },
      });
    } else {
      router.push({
        pathname: "/(diary)/mood",
        params: { date: dateKey },
      });
    }
  };
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);

  return (
      <View style={styles.container}>
        <DiaryScreen onEntriesLoaded={handleEntriesLoaded} />

        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => console.log("Search clicked",diaryEntries)} style={styles.icon}>
            <Ionicons name="search-outline" size={24} color="#4a9960" />
          </TouchableOpacity>
          <TouchableOpacity
              onPress={() => router.push({
                pathname: "/(diary)/monthView",
                params: {
                  year: currentYear,
                  month: currentMonth + 1
                }
              })}
              style={styles.icon}
          >
            <Foundation name="list" size={24} color="#4a9960" />
          </TouchableOpacity>
        </View>

        <View style={styles.yearMonthContainer}>
          <Text style={styles.headerText}>
            {`${currentYear}. ${currentMonth + 1}`}
          </Text>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Ionicons name="chevron-down-outline" size={20} color="#4a9960" />
          </TouchableOpacity>
        </View>

        <View style={styles.daysOfWeekContainer}>
          {daysOfWeek.map((day, index) => (
              <Text key={index} style={styles.dayOfWeekText}>
                {day}
              </Text>
          ))}
        </View>

        <View style={styles.calendar}>
            {daysInMonth.map((date, index) => {
                const dateKey = `${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-${date.day.toString().padStart(2, "0")}`;
                const emotion = selectedDates[dateKey];

                return (
                    <Day
                        key={index}
                        date={date}
                        today={today}
                        currentMonth={currentMonth}
                        currentYear={currentYear}
                        handleDayPress={handleDayPress}
                        emotion={emotion}
                        isInvisible={date.invisible} // 새로운 속성으로 표시 여부 전달
                    />
                );
            })}
        </View>

        {alertMessage && (
                    <Animated.View style={[styles.alertContainer, { opacity: alertOpacity }]}>
                      <Image
                          source={require("../../../assets/images/놀람.png")}
                          style={styles.alertIcon}
                      />
                      <Text style={styles.alertText}>{alertMessage}</Text>
                    </Animated.View>
                )}
        <DateModal
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
            onDateChange={(year, month) => {
              setCurrentYear(year);
              setCurrentMonth(month - 1);
            }}
        />
      </View>
  );
}


// 스타일 정의
const styles = StyleSheet.create({
  container: {
    flex: 1, // 전체 화면을 차지
    paddingHorizontal: 16, // 수평 패딩 추가
    paddingVertical: 7, // 수직 패딩 추가
    backgroundColor: "#ffffff", // 배경색 흰색 설정
  },
  headerIcons: {
    flexDirection: "row", // 아이콘들을 가로로 정렬
    justifyContent: "flex-end", // 오른쪽 정렬
    marginRight: 15, // 오른쪽 마진 추가
    marginBottom: 10, // 아래쪽 마진 추가
    top: 12,
  },
  icon: {
    marginLeft: 10, // 아이콘 간격 설정
  },
  yearMonthContainer: {
    alignItems: "center", // 수직 정렬
    flexDirection: "row", // 가로 정렬
    justifyContent: "center", // 가운데 정렬
    top: -20,
  },
  headerText: {
    fontSize: 17, // 글자 크기 설정
    fontWeight: "bold", // 굵은 글씨
    color: "#000000", // 글자색 검정
    marginRight: 10, // 오른쪽 마진
  },
  daysOfWeekContainer: {
    flexDirection: "row", // 가로로 정렬
    justifyContent: "space-around", // 공간을 균등하게 배치
    marginBottom: 8, // 아래쪽 마진 추가
  },
  dayOfWeekText: {
    color: "#666666", // 글자색 회색
    textAlign: "center", // 가운데 정렬
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around', // 요소 간격을 넓게 조정
  },

  dateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12, // 위아래 간격
    marginHorizontal: 0.1, // 좌우 간격 추가
  },
  circle: {
    width: 43, // 원형 배경의 너비
    height: 44, // 원형 배경의 높이
    borderRadius: 20, // 원형 설정
    backgroundColor: "#d3d3d3", // 회색 배경
    justifyContent: "center", // 가운데 정렬
    alignItems: "center", // 가운데 정렬
    marginBottom: 1, // 아래쪽 마진
  },
  dateText: {
    color: "#555555", // 글자색 어두운 회색
    fontSize: 10, // 글자 크기
    textAlign: "center", // 가운데 정렬
  },
  outsideMonth: {
    opacity: 0, // 외부 월 날짜를 투명하게 설정
  },
  todayCircle: {
    backgroundColor: "#4a9960", // 오늘 날짜 배경색 녹색
  },
  todayText: {
    color: "#4a9960", // 오늘 날짜 글자색 녹색
    fontWeight: "bold", // 굵은 글씨
  },
  alertContainer: {
    flexDirection: "row", // 가로로 정렬
    alignItems: "center", // 수직 가운데 정렬
    alignSelf: "center", // 부모에서 가운데 정렬
    position: "absolute", // 절대 위치 설정
    bottom: 30, // 화면 하단에서 30px 위에 위치
  },
  alertText: {
    color: "#666666", // 경고 메시지 글자색 회색
    fontWeight: "bold", // 굵은 글씨
  },
  alertIcon: {
    width: 50,           // 이미지 크기 조정
    height: 50,
    resizeMode: "contain",
    marginRight: 8,
    },
  emotionImage: {
    width: 43, // circle의 너비에 맞춰 이미지 너비 설정
    height: 44, // circle의 높이에 맞춰 이미지 높이 설정
    borderRadius: 20, // 이미지도 원형으로 설정
  },
});
