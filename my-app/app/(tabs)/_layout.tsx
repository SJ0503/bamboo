import React, { useEffect } from 'react';
import { TouchableOpacity, Text, BackHandler, Alert } from 'react-native';
import { Tabs } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { ProfileProvider } from '../../context/ProfileContext';
import CustomTabBar from '../../components/navigation/CustomTabBar';
import { serverAddress } from '@/components/Config';

export default function TabLayout() {
    const router = useRouter();

    const clearExceptToken = async () => {
        try {
            // 현재 저장된 모든 키 가져오기
            const allKeys = await AsyncStorage.getAllKeys();

            // `token` 키는 제외하고 삭제할 키 필터링
            const keysToDelete = allKeys.filter(key => key !== 'token');

            // 필터링된 키 삭제
            await AsyncStorage.multiRemove(keysToDelete);

            console.log('토큰 제외 모든 데이터 삭제 완료');
        } catch (error) {
            console.error('데이터 삭제 중 오류 발생:', error);
        }
    };

    const handleLogout = async () => {
        try {
            const userEmail = await AsyncStorage.getItem('userEmail');
            const token = await AsyncStorage.getItem('token');

            if (userEmail) {
                // 푸시 토큰 제거
                try {
                    await axios.post(`${serverAddress}/api/tokens/remove`, { userEmail, token });
                } catch (error) {
                    console.error("푸시 토큰 제거 중 오류 발생:", error);
                }

                // 사용자 상태 비활성화
                try {
                    await axios.post(`${serverAddress}/api/chat/updateUserStatus`, { userEmail, status: "inactive" });
                } catch (error) {
                    console.error("사용자 상태 업데이트 중 오류 발생:", error);
                }
            }
            try {
                await clearExceptToken();
                console.log('로그아웃 후 데이터 초기화 완료');
            } catch (error) {
                console.error('로그아웃 처리 중 오류 발생:', error);
            }
            Alert.alert("알림", "로그아웃 되었습니다.");
            router.replace("../(init)");
        } catch (error) {
            console.error("로그아웃 중 오류 발생:", error);
            Alert.alert("오류", "로그아웃 중 문제가 발생했습니다.");
        }
    };

    useEffect(() => {
        const backAction = () => {
            BackHandler.exitApp();
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );

        return () => backHandler.remove();
    }, []);

    return (
        <ProfileProvider>
            <Tabs
                tabBar={(props) => <CustomTabBar {...props} />}
                screenOptions={{
                    gestureEnabled: false, // iOS에서 뒤로가기 제스처 비활성화
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: "대화하기",
                        headerTitleAlign: "center",
                        gestureEnabled: false, // 각 화면에 대한 설정도 추가
                    }}
                />
                <Tabs.Screen
                    name="(diary)"
                    options={{
                        title: "다이어리",
                        headerTitleAlign: "center",
                        gestureEnabled: false,
                    }}
                />
                <Tabs.Screen
                    name="myPage"
                    options={{
                        title: "마이 페이지",
                        headerTitleAlign: "center",
                        gestureEnabled: false,
                    }}
                />
                <Tabs.Screen
                    name="report"
                    options={{
                        title: "보고서",
                        headerTitleAlign: "center",
                        gestureEnabled: false,
                    }}
                />
                <Tabs.Screen
                    name="setting"
                    options={{
                        title: "설정",
                        headerTitleAlign: "center",
                        gestureEnabled: false,
                        headerRight: () => (
                            <TouchableOpacity onPress={handleLogout}>
                                <Text style={{ color: 'black', marginRight: 10 }}>로그아웃</Text>
                            </TouchableOpacity>
                        ),
                    }}
                />
            </Tabs>
        </ProfileProvider>
    );
}
