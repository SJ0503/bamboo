import { useState, useEffect, useRef } from 'react';
import { Text, View, Alert, Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import axios from 'axios';
import {serverAddress} from "@/components/Config";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 알림 핸들러 설정
Notifications.setNotificationHandler({
    handleNotification: async (notification) => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

// 서버 URL 설정
const SERVER_URL = 'http://localhost:3000'; // 백엔드 서버 주소 (적절히 변경 필요)

// 클라이언트에서 직접 Expo 서버로 알림 전송
async function sendPushNotification(expoPushToken: string) {
    const message = {
        to: expoPushToken,
        sound: 'default',
        title: 'Welcome!',
        body: 'This is your first notification!',
        data: { someData: 'goes here' },
    };

    try {
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });
        console.log('Push notification sent:', response);
    } catch (error) {
        console.error('Error sending push notification:', error);
        Alert.alert('Error', 'Failed to send push notification');
    }
}

// 푸시 알림 등록 및 백엔드 전송
export async function registerForPushNotificationsAsync() {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 500, 250, 500],
            lightColor: '#3a7c54',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            Alert.alert('Permission Error', 'Push notification permissions not granted!');
            return;
        }

        try {
            // Expo 푸시 토큰 가져오기
            const pushTokenString = (
                await Notifications.getExpoPushTokenAsync({
                    projectId: Constants.expoConfig?.extra?.eas?.projectId,
                })
            ).data;
            console.log('Expo Push Token:', pushTokenString);
            const userEmail = await AsyncStorage.getItem('userEmail');
            await AsyncStorage.setItem('token', pushTokenString);
            console.log("토큰저장을위한 로그",userEmail,pushTokenString);
            // DB 토큰 등록
            await axios.post(`${serverAddress}/api/tokens/register`, {
                token: pushTokenString,
                userEmail: userEmail,
            });
            console.log('Push token registered with server:', pushTokenString);

            return pushTokenString;
        } catch (error) {
            console.error('Error registering push notifications:', error);
        }
    } else {
        Alert.alert('Error', 'Must use a physical device for push notifications');
    }
}

export default function App() {
    const [expoPushToken, setExpoPushToken] = useState('');
    const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);
    const notificationListener = useRef<Notifications.EventSubscription>();
    const responseListener = useRef<Notifications.EventSubscription>();

    useEffect(() => {
        // 푸시 알림 등록 및 토큰 저장
        registerForPushNotificationsAsync()
            .then((token) => {
                setExpoPushToken(token ?? '');
            })
            .catch((error) => console.error('Push notification registration error:', error));

        // 알림 수신 리스너 추가
        notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
            setNotification(notification);
            console.log('Notification received:', notification);
        });

        // 알림 응답 리스너 추가
        responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
            console.log('Notification response received:', response);
        });

        return () => {
            // 리스너 제거
            if (notificationListener.current) {
                Notifications.removeNotificationSubscription(notificationListener.current);
            }
            if (responseListener.current) {
                Notifications.removeNotificationSubscription(responseListener.current);
            }
        };
    }, []);

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text>Your Expo push token: {expoPushToken}</Text>
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Text>Title: {notification && notification.request.content.title}</Text>
                <Text>Body: {notification && notification.request.content.body}</Text>
                <Text>Data: {notification && JSON.stringify(notification.request.content.data)}</Text>
            </View>
        </View>
    );
}
