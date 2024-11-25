import React, { useState } from 'react';
import { View, Text, StyleSheet, Animated, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import JoinBG from '../../components/JoinBG';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import SmoothCurvedButton from '../../components/SmoothCurvedButton';

const UserGuide = () => {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [pageIndex, setPageIndex] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [nextAnimating, setNextAnimating] = useState(false);
  const [prevAnimating, setPrevAnimating] = useState(false);

  const pages = [
    {
      icon: 'chatbubbles-outline',
      title: '대화하기',
      description: '지난 대화를 기억해 밤부와 얘기할 수 있습니다.',
    },
    {
      icon: 'calendar-outline',
      title: '일기장',
      description: '일기를 작성할 수 있고, 작성된 일기를 밤부가 학습합니다.',
    },
    {
      icon: 'analytics-outline',
      title: '보고서',
      description: '감정상태 보고서입니다, 자주 느끼는 감정을 확인합니다.',
    },
    {
      icon: 'person-outline',
      title: '마이페이지',
      description: '어플을 이용하면 밤부가 자라납니다.',
    },
  ];

  const handleNext = () => {
    if (pageIndex < pages.length - 1 && !nextAnimating) {
      setNextAnimating(true);
      animateContent(() => {
        setPageIndex(pageIndex + 1);
        setNextAnimating(false);
      });
    }
  };

  const handlePrevious = () => {
    if (pageIndex > 0 && !prevAnimating) {
      setPrevAnimating(true);
      animateContent(() => {
        setPageIndex(pageIndex - 1);
        setPrevAnimating(false);
      });
    }
  };

  const animateContent = (callback: () => void) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      callback();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  return (
    <JoinBG>
      <View style={styles.container}>
        <Animated.View style={[styles.iconContainer, { opacity: fadeAnim, top: -height * 0.05 }]}>
          <TabBarIcon name={pages[pageIndex].icon} color="#4a9960" size={150} />
        </Animated.View>
        <Animated.Text style={[styles.title, { opacity: fadeAnim, top: -height * 0.03 }]}>
          {pages[pageIndex].title}
        </Animated.Text>
        <Animated.Text style={[styles.description, { opacity: fadeAnim, top: -height * 0.04 }]}>
          {pages[pageIndex].description}
        </Animated.Text>
        <View style={styles.pagination}>
          {pages.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                pageIndex === index && styles.activeDot,
                { top: -height * 0.05 },
              ]}
            />
          ))}
        </View>
        <View
          style={[
            styles.buttonGroup,
            {
              flexDirection: 'column',
              alignItems: 'center',
              width: '80%',
              position: 'absolute',
              top: height * 0.60,
            },
          ]}
        >
          {pageIndex > 0 && (
            <SmoothCurvedButton
              title="이전"
              onPress={handlePrevious}
              disabled={prevAnimating}
              style={{
                width: '100%',
                marginBottom: 10,
                opacity: prevAnimating ? 0.5 : 1,
              }}
            />
          )}
          {pageIndex < pages.length - 1 ? (
            <SmoothCurvedButton
              title="다음"
              onPress={handleNext}
              disabled={nextAnimating}
              style={{
                width: '100%',
                opacity: nextAnimating ? 0.5 : 1,
                alignSelf: 'center',
              }}
            />
          ) : (
            <SmoothCurvedButton
              title="완료"
              onPress={() => router.push('../../(init)')}
              disabled={nextAnimating}
              style={{
                width: '100%',
                opacity: nextAnimating ? 0.5 : 1,
                alignSelf: 'center',
              }}
            />
          )}
        </View>
      </View>
    </JoinBG>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    marginBottom: 20,
  },
  pagination: {
    flexDirection: 'row',
    marginVertical: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#555',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
});

export default UserGuide;
