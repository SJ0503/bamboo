import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, useWindowDimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import axios from 'axios';

export default function BackgroundAnimation() {
  const { width, height } = useWindowDimensions(); // 화면의 동적 너비와 높이 가져오기
  const [data, setData] = useState({ message: '' });

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const response = await axios.get('http://10.0.2.2:8082/api');
        setData({ message: response.data });
      } catch (error) {
        console.error('Error fetching message:', error);
      }
    };
    fetchMessage();
  }, []);

  // 화면 크기에 따라 적절한 애니메이션 크기 계산
  const animationWidth = Math.min(Math.max(width * 0.75, 300), 800); // 최소 300, 최대 800
  const animationHeight = Math.min(Math.max(height * 0.1, 350), 1000); // 최소 400, 최대 1000

  return (
    <View style={styles.container}>
      <LottieView
        source={require('../assets/lottie/bamboo.json')} // Lottie 파일 경로를 지정하세요
        autoPlay
        loop
        style={[styles.backgroundAnimation, { width: animationWidth, height: animationHeight }]}
      />
      {/* 서버에서 받아온 메시지를 표시 */}
      <Text style={styles.subtitle}>{data.message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundAnimation: {
    position: 'absolute', // 절대 위치로 화면 덮기
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: 'white', // 배경에 맞게 텍스트 색상 조정 가능
    zIndex: 1, // 텍스트를 애니메이션 위에 표시
  },
});
