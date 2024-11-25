// app/(init)/index.tsx
import React, { useState } from 'react';
import { View, StyleSheet, useWindowDimensions, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router'; // expo-router의 useRouter 사용
import BackGround from "../../components/FirstBG";

export default function InitialScreen() {
    const router = useRouter(); // useRouter 가져오기
    const { height, width } = useWindowDimensions();
    const [isNavigating, setIsNavigating] = useState(false);

    const handlePress = (path) => {
        if (!isNavigating) {
            setIsNavigating(true);
            router.push(path); // router.push로 경로 이동
            setTimeout(() => setIsNavigating(false), 1000);
        }
    };

    return (
        <View style={styles.container}>
            <View style={[styles.backgroundContainer, { width, height }]}>
                <BackGround width={width} height={height} />
            </View>
            <View style={[styles.buttonsContainer, dynamicStyles(height).buttonsContainer, { bottom: height*0.09 }]}>
                <View style={[styles.buttonWrapper, dynamicStyles(height).buttonWrapper]}>
                    {/* 회원가입 버튼을 중앙에 배치 */}
                    <TouchableOpacity
                        style={[styles.signupButton, { alignSelf: 'center' }]}
                        onPress={() => handlePress('/(join)')} // 절대 경로 사용
                        disabled={isNavigating}
                        activeOpacity={0.7} // Opacity 변경
                    >
                        <Text style={styles.signupButtonText}>회원가입</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* 로그인 버튼을 화면 가장 아래로 배치 */}
            <TouchableOpacity
                style={[styles.loginButton, dynamicStyles(height).loginButton, { width, height: '10%' }]}
                onPress={() => handlePress('/(join)/login')}
                disabled={isNavigating}
                activeOpacity={0.7} // Opacity 변경
            >
                <Text style={[styles.loginButtonText,{fontSize:width*0.07}]}>시작하기</Text>
            </TouchableOpacity>
        </View>
    );
}

const dynamicStyles = (height) => StyleSheet.create({
    buttonsContainer: {
        width: '100%',
        alignItems: 'center',
    },
    buttonWrapper: {
        height: height < 900 ? 40 : height * 0.06,
        width: '60%',
    },
    loginButton: {
        position: 'absolute',
        bottom: 0, // 화면 아래에 위치
        alignSelf: 'center',
        backgroundColor: '#4a9960', // 버튼 배경색
        paddingHorizontal: 100, // 너비를 늘리기 위해 수평 패딩 추가
        justifyContent: 'center', // 수직 중앙 정렬
        alignItems: 'center', // 가로 중앙 정렬
    },
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    backgroundContainer: {
        position: 'absolute',
        top: 0,
    },
    buttonsContainer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    signupButtonText: {
        fontSize: 13,
        textDecorationLine: 'underline', // 밑줄 추가
    },
    loginButtonText: {
        fontSize: 20, // 글자 크기 키움
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
});