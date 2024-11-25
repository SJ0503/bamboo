import React, { useEffect, useRef } from 'react';
import { View, Text, Alert, StyleSheet, Image, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import JoinBG from '../../components/JoinBG';
import BambooHead from "../../assets/images/밤부_머리1.png";
import em_happy from "../../assets/images/기쁨.png";
import em_angry from "../../assets/images/화남.png";
import em_surprise from "../../assets/images/놀람.png";
import em_fear from "../../assets/images/두려움.png";
import em_sad from "../../assets/images/슬픔.png";
import em_dislike from "../../assets/images/혐오.png";
import em_soso from "../../assets/images/쏘쏘.png";
import {serverAddress} from '../../components/Config';

const SendUserInfo = () => {
    const { userData, testResults, chatbotName } = useLocalSearchParams();
    const router = useRouter();
    const fadeAnim = useRef(
        [new Animated.Value(0), new Animated.Value(0), new Animated.Value(0),
            new Animated.Value(0), new Animated.Value(0), new Animated.Value(0),
            new Animated.Value(0)]
    ).current;
    console.log("3차",userData,testResults,chatbotName)

    useEffect(() => {
        const sendDataToServer = async () => {
            try {
                let parsedUserData = {};

                if (typeof userData === 'string') {
                    parsedUserData = JSON.parse(userData);
                }

                const data = {
                    ...parsedUserData,
                    chatbotType: testResults,
                    chatbotName,
                    chatbotLevel: 1,
                };

                const response = await fetch(`${serverAddress}/api/users/join`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                if (!response.ok) {
                    throw new Error(`HTTP 에러: ${response.status}`);
                }

                // 채팅방 정보 설정
                const chatRoomData = {
                    userEmail: parsedUserData.userEmail, // userEmail
                    croomTitle: parsedUserData.userEmail+ "의 채팅방", // 채팅방 제목 설정
                    croomDesc: parsedUserData.userEmail+"의 채팅방" // 채팅방 설명 설정
                };

                // 채팅방 생성 요청
                const chatRoomResponse = await fetch(`${serverAddress}/api/chat/create_room`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(chatRoomData),
                });

                if (!chatRoomResponse.ok) {
                    throw new Error(`채팅방 생성 실패: ${chatRoomResponse.status}`);
                }

                // 애니메이션 시퀀스 시작
                Animated.stagger(700, fadeAnim.map(anim =>
                    Animated.timing(anim, {
                        toValue: 1,
                        duration: 700,
                        useNativeDriver: true,
                    })
                )).start(() => {
                    // 애니메이션이 모두 끝난 후 Alert를 표시
                    Alert.alert('성공', '회원 정보가 성공적으로 전송되었습니다.', [
                        {
                            text: 'OK',
                            onPress: () => router.push('index3'),
                        },
                    ]);
                });

            } catch (error) {
                console.error('Error:', error);
                Alert.alert('오류', `서버로 데이터를 전송하는 중 문제가 발생했습니다: ${error.message}`);
            }
        };

        sendDataToServer();
    }, []);

    return (
        <JoinBG>
            <View style={styles.container}>
                <View style={styles.circle}>
                    <Image source={BambooHead} style={styles.bambooImage} />
                    <Animated.Image source={em_happy} style={[styles.emotionImage, styles.position1,{ opacity: fadeAnim[0] }]} />
                    <Animated.Image source={em_angry} style={[styles.emotionImage, styles.position2,{ opacity: fadeAnim[1] }]} />
                    <Animated.Image source={em_surprise} style={[styles.emotionImage, styles.position3,{ opacity: fadeAnim[2] }]} />
                    <Animated.Image source={em_fear} style={[styles.emotionImage, styles.position4,{ opacity: fadeAnim[3] }]} />
                    <Animated.Image source={em_sad} style={[styles.emotionImage, styles.position5,{ opacity: fadeAnim[4] } ]} />
                    <Animated.Image source={em_dislike} style={[styles.emotionImage, styles.position6,{ opacity: fadeAnim[5] }]} />
                    <Animated.Image source={em_soso} style={[styles.emotionImage, styles.position7,{ opacity: fadeAnim[6] }]} />
                </View>
                <Text style={styles.text}>정보를 서버로 전송 중입니다...</Text>
            </View>
        </JoinBG>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    circle: {
        position: 'relative',
        width: 320,
        height: 320,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bambooImage: {
        width: 100,
        height: 100,
        resizeMode: 'contain',
    },
    emotionImage: {
        position: 'absolute',
        width: 40,
        height: 40,
        resizeMode: 'contain',
        margin: 5, // 위치를 고정하면서 여백 확보
    },
    position1: {
        top: 20,
        left: '50%',
        marginLeft: -20,
    },
    position2: {
        top: '20%',
        right: '20%',
    },
    position3: {
        top: '45%',
        right: 30,
    },
    position4: {
        bottom: '15%',
        right: '25%',
    },
    position5: {
        bottom: 45,
        left: '35%',
        marginLeft: -25,
    },
    position6: {
        bottom: '38.5%',
        left: '10%',
    },
    position7: {
        top: '20%',
        left: '20%',
    },
    text: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    },
});

export default SendUserInfo;
