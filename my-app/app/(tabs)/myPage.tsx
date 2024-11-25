import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Alert,
    ImageBackground,
    Image,
    ScrollView,
    useWindowDimensions,
    Animated,
    Easing
} from 'react-native';
import { getUserInfo } from '../../storage/storageHelper';
import { useFocusEffect } from '@react-navigation/native';
import { useProfile } from '../../context/ProfileContext';
import AsyncStorage from '@react-native-async-storage/async-storage'; // 올바르게 임포트
import { LogBox } from 'react-native';


const backgroundImage = require('../../assets/images/대나무숲_배경.png');
const pandaImage = require('../../assets/images/판다.png');
const bambooBody1 = require('../../assets/images/밤부_몸통1.png');
const bambooBody2 = require('../../assets/images/밤부_몸통2.png');
const bambooBody3 = require('../../assets/images/밤부_몸통3.png');
const bambooBody4 = require('../../assets/images/밤부_몸통4.png');
const bambooRoot = require('../../assets/images/밤부_밑동.png');
const bambooHead1 = require('../../assets/images/밤부_머리1.png');
const bambooHead2 = require('../../assets/images/밤부_머리2.png');
const cloud1 = require('../../assets/images/구름1.png');
const cloud2 = require('../../assets/images/구름2.png');
const bamboo = require('../../assets/images/밤부.png');
const shadow = require('../../assets/images/그림자.png');

// LogBox 경고 숨기기
LogBox.ignoreAllLogs();
if (process.env.NODE_ENV === 'production') {
    console.log = () => {};
    console.warn = () => {};
    console.error = () => {};
}
export default function MyPage() {
    const { width, height } = useWindowDimensions();
    const scrollViewRef = useRef(null);
    const { chatbotLevel } = useProfile();
    const [displayedLevel, setDisplayedLevel] = useState(chatbotLevel);
    const [chatbotName, setChatbotName] = useState('');
    const [textColor, setTextColor] = useState('#333');
    const [cloud1Top, setCloud1Top] = useState(`${45 + Math.random() * 8}%`);
    const [cloud2Top, setCloud2Top] = useState(`${45 + Math.random() * 8}%`);
    const gapBetweenBodies = -7;
    const scrollThreshold = 600;
    const aspectRatio = width / height;
    const cloud1Animation = useRef(new Animated.Value(-width * 0.25)).current;
    const cloud2Animation = useRef(new Animated.Value(-width * 0.25)).current;
    const [currentBambooHead, setCurrentBambooHead] = useState(bambooHead1);


    const createStarAnimations = () => {
        return Array.from({ length: 20 }, () => ({
            opacity: new Animated.Value(0),
            scale: new Animated.Value(1),
            top: `${1 + Math.random() * 15}%`,
            left: `${Math.random() * 100}%`,
        }));
    };

    const [starAnimations] = useState(createStarAnimations());

    const animateStars = () => {
        starAnimations.forEach((star) => {
            const animateStar = () => {
                const delay = Math.random() * 2000;
                const loop = () => {
                    star.opacity.setValue(0);
                    star.scale.setValue(1);
                    Animated.sequence([
                        Animated.delay(delay),
                        Animated.parallel([
                            Animated.timing(star.opacity, {
                                toValue: 1,
                                duration: 1000,
                                easing: Easing.linear,
                                useNativeDriver: true,
                            }),
                            Animated.timing(star.scale, {
                                toValue: 1.5,
                                duration: 1000,
                                easing: Easing.linear,
                                useNativeDriver: true,
                            }),
                        ]),
                        Animated.parallel([
                            Animated.timing(star.opacity, {
                                toValue: 0,
                                duration: 1000,
                                easing: Easing.linear,
                                useNativeDriver: true,
                            }),
                            Animated.timing(star.scale, {
                                toValue: 1,
                                duration: 1000,
                                easing: Easing.linear,
                                useNativeDriver: true,
                            }),
                        ]),
                    ]).start(() => {
                        star.top = `${1 + Math.random() * 15}%`;
                        star.left = `${Math.random() * 100}%`;
                        requestAnimationFrame(loop);
                    });
                };
                requestAnimationFrame(loop);
            };
            animateStar();
        });
    };

    useEffect(() => {
        const loadUserInfo = async () => {
            try {
                const userInfo = await getUserInfo();
                if (userInfo) {
                    setChatbotName(userInfo.chatbotName);
                } else {
                    Alert.alert("오류", "사용자 정보를 불러올 수 없습니다.");
                }
            } catch (error) {
                console.error('Error fetching user info:', error);
                Alert.alert("오류", "사용자 정보를 불러오는 중 문제가 발생했습니다.");
            }
        };
        loadUserInfo();
        animateStars();

        const animateCloud1 = () => {
            Animated.sequence([
                Animated.timing(cloud1Animation, {
                    toValue: width,
                    duration: 12000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
                Animated.timing(cloud1Animation, {
                    toValue: -width * 0.25,
                    duration: 0,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                setCloud1Top(`${47 + Math.random() * 8}%`);
                animateCloud1();
            });
        };

        const animateCloud2 = () => {
            Animated.sequence([
                Animated.timing(cloud2Animation, {
                    toValue: width,
                    duration: 8000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
                Animated.timing(cloud2Animation, {
                    toValue: -width * 0.25,
                    duration: 0,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                setCloud2Top(`${47 + Math.random() * 8}%`);
                animateCloud2();
            });
        };

        animateCloud1();
        animateCloud2();
    }, [width, height]);
    useFocusEffect(
        React.useCallback(() => {
            const updateDisplayedLevel = async () => {
                try {
                    const userInfo = await AsyncStorage.getItem('userInfo');
                    if (userInfo) {
                        const parsedUserInfo = JSON.parse(userInfo);
                        const levelFromStorage = parsedUserInfo?.chatbotLevel || 1;

                        console.log("[useFocusEffect] 챗봇 레벨 가져옴:", levelFromStorage);

                        if (displayedLevel !== levelFromStorage) {
                            setDisplayedLevel(levelFromStorage);
                        }
                    } else {
                        console.warn("[useFocusEffect] userInfo가 없습니다.");
                    }
                } catch (error) {
                    console.error("[useFocusEffect] userInfo 불러오는 중 오류 발생:", error);
                }
            };

            updateDisplayedLevel();

            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }, [displayedLevel, chatbotLevel]) // chatbotLevel 추가
    );
    // Bamboo Head 이미지 토글 로직
    useEffect(() => {
        const toggleBambooHead = setInterval(() => {
            setCurrentBambooHead((prev) =>
                prev === bambooHead1 ? bambooHead2 : bambooHead1
            );
        }, 1000);

        return () => clearInterval(toggleBambooHead); // 컴포넌트 언마운트 시 정리
    }, []); // 의존성 배열을 비워서 한 번만 실행


    const displayLevel = displayedLevel !== null ? (displayedLevel - 1) % 30 + 1 : 1;
    const bambooLevel = displayedLevel !== null ? Math.floor(displayedLevel / 30) : 1;
//     const bambooLevel = 128;
//     const displayLevel = 30;
    const treeLevel = `Lv ${displayLevel}`;

    // Bamboo Stack 렌더링
    // Bamboo Body와 Root는 한 번만 렌더링되도록 별도 useMemo
    const renderBambooBodyAndRoot = useMemo<JSX.Element[]>(() => {
        const bambooElements = [];
        const bambooBodyWidth = aspectRatio > 0.6 ? width * 0.5 : width * 0.5;
        const bambooBodyHeight = aspectRatio > 0.6 ? height * 0.07 : height * 0.12;

        // Bamboo Body 랜덤 추가
        const bambooBodies = [bambooBody1, bambooBody2, bambooBody3, bambooBody4];
        for (let i = 0; i < displayLevel; i++) {
            const randomBody = bambooBodies[Math.floor(Math.random() * bambooBodies.length)];
            bambooElements.push(
                <Image
                    key={`bamboo-body-${i}`}
                    source={randomBody}
                    style={[
                        styles.bambooBody,
                        {
                            width: bambooBodyWidth,
                            height: bambooBodyHeight,
                            marginBottom: -height * 0.0625,
                            zIndex: displayLevel +1 - i, // 레벨에 따라 zIndex 조정
                        },
                    ]}
                    resizeMode="contain"
                />
            );
        }

        // Bamboo Root 추가
        bambooElements.push(
            <Image
                key="bamboo-root"
                source={bambooRoot}
                style={[
                    styles.bambooRoot,
                    {
                        width: bambooBodyWidth,
                        height: bambooBodyHeight * 1,
                        zIndex: 1, // 가장 아래에 위치
                        marginTop: -5,
                    },
                ]}
                resizeMode="contain"
            />
        );

        return bambooElements;
    }, [displayLevel, width, height]); // Bamboo Body와 Root는 displayLevel에 따라 렌더링

    // Bamboo Head는 별도로 관리
    const renderBambooHead = (
        <Image
            key="bamboo-head"
            source={currentBambooHead}
            style={[
                styles.bambooHead,
                {
                    width: aspectRatio > 0.6 ? width * 0.5 : width * 0.5,
                    height: (aspectRatio > 0.6 ? height * 0.07 : height * 0.11) * 1.1,
                    zIndex: displayLevel +1 + 1,
                    marginBottom: -height * 0.065,
                },
            ]}
            resizeMode="contain"
        />
    );

    const getBambooStyle = (level) => {
        const isWideAspect = aspectRatio > 0.6;
        switch (level) {
            case 1:
                return {
                    width: width * 0.1,
                    height: height * 0.1,
                    bottom: isWideAspect ? '9%' : '24%',
                    left: '60%'
                };
            case 2:
                return {
                    width: width * 0.2,
                    height: height * 0.13,
                    bottom: isWideAspect ? '8%' : '24%',
                    left: '20%'
                };
            case 3:
                return {
                    width: width * 0.3,
                    height: height * 0.3,
                    bottom: isWideAspect ? '7%' : '15%',
                    left: '55%'
                };
            case 4:
                return {
                    width: width * 0.4,
                    height: height * 0.5,
                    bottom: isWideAspect ? '5.5%' : '7%',
                    left: '70%'
                };
            case 5:
                return {
                    width: width * 0.5,
                    height: height * 0.8,
                    bottom: isWideAspect ? '1%' : '1%',
                    left: -60
                };
            default:
                return {
                    width: width * 0.5,
                    height: height * 0.25,
                    bottom: isWideAspect ? '8%' : '17%'
                };
        }
    };

    const renderBambooImages = useMemo<JSX.Element[]>(() => {
        const bambooElements = [];
        for (let i = 0; i < bambooLevel; i++) {
            bambooElements.push(
                <Image
                    key={`bamboo-${i}`}
                    source={bamboo}
                    style={[
                        styles.bamboo,
                        getBambooStyle(i + 1),
                    ]}
                    resizeMode="contain"
                />
            );
        }
        return bambooElements;
    }, [bambooLevel, width, height]);

    return (
        <View style={styles.backgroundContainer}>
            <View style={styles.fixedInfoContainer}>
                <Text style={[styles.levelText, { color: textColor }]}>{treeLevel}</Text>
                <Text style={[styles.treeNameText, { color: textColor }]}>{chatbotName}</Text>
            </View>

            <ScrollView
                ref={scrollViewRef}
                style={styles.scrollContainer}
                contentContainerStyle={[styles.scrollContent]}
                showsVerticalScrollIndicator={false}
                onScroll={(event) => {
                    const scrollY = event.nativeEvent.contentOffset.y;
                    setTextColor(scrollY > scrollThreshold ? '#000000' : '#FFFFFF');
                }}
                scrollEventThrottle={32}
            >
                <ImageBackground source={backgroundImage} style={[styles.background, { height: aspectRatio > 0.6 ? height * 3 : height * 2.2 }]}
                    resizeMode="cover">
                    <Animated.Image source={cloud1}
                        style={[styles.cloud, { top: cloud1Top, transform: [{ translateX: cloud1Animation }] }]}
                        resizeMode="contain" />
                    <Animated.Image source={cloud2}
                        style={[styles.cloud, { top: cloud2Top, transform: [{ translateX: cloud2Animation }] }]}
                        resizeMode="contain" />

                    {starAnimations.map((star, index) => (
                        <Animated.View
                            key={index}
                            style={[
                                styles.star,
                                {
                                    top: star.top,
                                    left: star.left,
                                    opacity: star.opacity,
                                    transform: [{ scale: star.scale }],
                                },
                            ]}
                        />
                    ))}

                    <View style={styles.bambooContainer}>
                        {renderBambooHead}
                        {renderBambooBodyAndRoot}
                    </View>

                    <Image source={pandaImage}
                        style={
                            [styles.pandaImage,

                            {
                                width: aspectRatio > 0.6 ? width * 0.2 : width * 0.2,
                                height: aspectRatio > 0.6 ? height * 0.2 : height * 0.2
                            }]}
                        resizeMode="contain" />
                    {renderBambooImages}
                    <Image
                      source={shadow}
                      style={[
                        styles.shadow, // 기존의 스타일 객체
                        {
                          top: height * 1.975, // 추가로 적용할 스타일
                          width: width * 1,
                          height: height * 0.19,
                          left:width*0.007,
                          zIndex:0,
                          opacity: 0.6, // 투명도를 50%로 설정
                        },
                      ]}
                      resizeMode="contain" // 크기를 조정하면서 잘리지 않도록 설정
                    />


                </ImageBackground>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    backgroundContainer: { flex: 1 },
    scrollContainer: { flex: 1 },
    scrollContent: { flexGrow: 1, justifyContent: 'flex-end' },
    background: { flex: 1, width: '100%' },
    fixedInfoContainer: {
        position: 'absolute',
        top: 20,
        right: 20,
        alignItems: 'flex-end',
        zIndex: 1,
    },
    levelText: { fontSize: 18, fontWeight: 'bold' },
    treeNameText: { fontSize: 20, fontWeight: 'bold' },
    cloud: {
        position: 'absolute',
        width: '25%',
        height: '25%',
    },
    star: {
        position: 'absolute',
        width: 2,
        height: 2,
        borderRadius: 3,
        backgroundColor: '#FFFFFF',
    },
    bambooContainer: {
        alignItems: 'center',
        justifyContent: 'flex-end',
        position: 'absolute',
        bottom: '3%',
        left: '25%',
    },
    pandaImage: {
        position: 'absolute',
        bottom: '8%',
        left: '20%',
    },
    bambooBody: {
        alignSelf: 'center',
    },
    bambooHead: {
        alignSelf: 'center',
    },
    bamboo: {
        position: 'absolute',
        left: '10%',
    },
});
