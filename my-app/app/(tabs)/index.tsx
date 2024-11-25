import React, {useState, useEffect, useRef} from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Image,
    KeyboardAvoidingView,
    Platform,
    Alert,
    useWindowDimensions,
    Keyboard,
    Animated
} from 'react-native';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {getUserInfo, getUserProfileImage} from '../../storage/storageHelper';
import {useFocusEffect} from '@react-navigation/native';
import BambooHead from '../../assets/images/밤부_머리1.png';
import BambooPanda from '../../assets/images/bamboo_panda.png';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {serverAddress} from '../../components/Config';
import {ChatMessage, getChatHistory} from "../../components/getChatHistory";
import * as Clipboard from 'expo-clipboard';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'; // KeyboardAwareScrollView 임포트
import {useRoute} from '@react-navigation/native';
import {useProfile} from '../../context/ProfileContext';
import {ThemedText} from "@/components/ThemedText";
import {eventEmitter} from "@/app/_layout";

// 메시지 구조를 정의하는 인터페이스
interface Message {
    createdAt: string;
    sender: string;
    text: string;
    avatar: any;
    name: string;
    timestamp: string;
    showTimestamp?: boolean;
    evaluation?: 'like' | 'dislike' | null;
    chatIdx?: number;
}

// 요일 배열
const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];

// 현재 날짜와 요일을 가져오는 함수
const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const dayOfWeek = daysOfWeek[today.getDay()]; // 요일 가져오기
    return `${year}-${month}-${day} ${dayOfWeek}`;
};


export default function ChatbotPage() {
    const {width, height} = useWindowDimensions();
    const [currentDate, setCurrentDate] = useState<string>(getCurrentDate());
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [inputAreaHeight, setInputAreaHeight] = useState(height * 0.05);
    const [userNick, setUserNick] = useState<string>('');
    const [chatbotName, setChatbotName] = useState<string>('');
    const { chatbotLevel, setChatbotLevel } = useProfile();
    const [userAvatar, setUserAvatar] = useState(profileImageUri || BambooPanda);
    const [userEmail, setUserEmail] = useState<string>('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);
    const serverUrl = `${serverAddress}/api/chat/getChatResponse`;
    const [typingDots, setTypingDots] = useState(''); // 점 애니메이션을 위한 상태
    const [isCountdownStarted, setIsCountdownStarted] = useState(false);
    const [isActiveSession, setIsActiveSession] = useState(false); // 현재 세션 활성화 여부
    // 이전 이미지 URI를 저장하는 useRef 생성
    const prevImageUriRef = useRef<string | null>(null); // 이전 이미지 URI를 저장하는 useRef
    const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);
    const {profileImageUri} = useProfile();
    const dotOpacity1 = useRef(new Animated.Value(0)).current;
    const dotOpacity2 = useRef(new Animated.Value(0)).current;
    const dotOpacity3 = useRef(new Animated.Value(0)).current;
    let countdownInterval: NodeJS.Timeout | null = null;
    let messagesToSend: string[] = [];
    const countdownDuration = 3; // 5초 카운트다운
    const messagesToSendRef = useRef<string[]>([]);
    const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);


    useEffect(() => {
        if (isTyping) {
            // 점 애니메이션 반복
            const animateDots = Animated.loop(
                Animated.sequence([
                    Animated.timing(dotOpacity1, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(dotOpacity2, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(dotOpacity3, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    // 세 번째 점이 나타난 후에 첫 번째 점이 사라짐
                    Animated.timing(dotOpacity1, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(dotOpacity2, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(dotOpacity3, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                ])
            );

            animateDots.start();

            return () => animateDots.stop();
        }
    }, [isTyping, dotOpacity1, dotOpacity2, dotOpacity3]);


    const handleLongPress = (message, messageIndex) => {
        Alert.alert(
            "메시지 옵션",
            "이 메시지를 어떻게 할까요?",
            [
                {
                    text: "복사",
                    onPress: async () => {
                        await Clipboard.setStringAsync(message.text); // 클립보드에 메시지 텍스트 복사
                        Alert.alert("복사됨", "메시지가 복사되었습니다.");
                    }
                },
                {
                    text: "삭제",
                    onPress: () => deleteMessage(message.chatIdx) // 메시지 삭제 함수 호출
                },
                {
                    text: "취소",
                    style: "cancel"
                }
            ],
            {cancelable: true}
        );
    };


    const deleteMessage = async (chatIdx) => {
        try {
            if (!chatIdx) {
                // 클립보드에서 복사한 메시지를 즉시 삭제하려면 로컬 상태만 업데이트
                setMessages((prevMessages) =>
                    prevMessages.filter((message) => message.chatIdx !== chatIdx)
                );
                return;
            }

            // 서버 요청을 통해 메시지 삭제
            const response = await axios.delete(`${serverAddress}/api/chat/deleteMessage`, {
                params: { chatIdx },
            });

            console.log("Message deleted successfully:", response.data);

            // 서버에서 삭제된 메시지를 화면에서도 제거
            setMessages((prevMessages) =>
                prevMessages.filter((message) => message.chatIdx !== chatIdx)
            );
        } catch (error) {
            console.error("메시지 삭제 오류:", error);
        }
    };



    // 클립보드에 텍스트 복사
    const copyToClipboard = (text: string) => {
        Clipboard.setString(text);
    };

    // 클립보드에서 텍스트 읽기
    const getClipboardContent = async () => {
        const content = await Clipboard.getStringAsync();
        console.log(content);
        return content;
    };
    const scrollToBottom = (animated = true) => {
        if (scrollViewRef.current && isAutoScrollEnabled) {
            scrollViewRef.current.scrollToEnd({animated});
        }
    };

    useEffect(() => {
        // 키보드 표시/숨김에 따른 스크롤 처리
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => scrollToBottom(true));
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => scrollToBottom(true));
        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    useEffect(() => {
        // 메시지 추가, 타이핑 상태 변경 시 스크롤 처리
        scrollToBottom(true);
    }, [messages, isTyping]);

    const handleScroll = (event) => {
        const {layoutMeasurement, contentOffset, contentSize} = event.nativeEvent;
        const isBottomReached = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
        setIsAutoScrollEnabled(isBottomReached);
    };

    // 날짜 업데이트 및 자정에 날짜 메시지 추가
    useEffect(() => {
        const updateDate = () => {
            const newDate = getCurrentDate();
            if (newDate !== currentDate) {
                // 날짜 변경 시 시스템 메시지 추가
                setMessages(prevMessages => [
                    ...prevMessages,
                    {
                        createdAt: newDate,
                        sender: 'system',
                        text: newDate,
                        avatar: null,
                        name: '',
                        timestamp: '',
                        showTimestamp: false,
                    },
                ]);
                setCurrentDate(newDate);
            }
        };

        // 처음 실행 시 업데이트
        updateDate();

        // 1분마다 업데이트 확인
        const timer = setInterval(updateDate, 60000);

        return () => clearInterval(timer);
    }, [currentDate]);


    useEffect(() => {
        setUserAvatar(profileImageUri ? {uri: profileImageUri} : BambooPanda);
        // console.log('프로필 이미지 URI가 변경됨:', profileImageUri || '기본 이미지(BambooPanda)');
    }, [profileImageUri]);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const userData = await getUserInfo(); // 사용자 정보를 서버에서 가져오기
                if (userData) {
                    setUserNick(userData.userNick || '');
                    setChatbotName(userData.chatbotName || '챗봇');
                    setUserEmail(userData.userEmail);

                    // 프로필 이미지 URL을 정확히 설정
                    let profileImageUrl = userData.profileImage;

                    if (profileImageUrl) {
                        // URL이 서버 주소로 시작하지 않으면 서버 주소를 추가
                        if (!profileImageUrl.startsWith('http')) {
                            profileImageUrl = `${serverAddress}/uploads/profile/images/${profileImageUrl}`;
                        }
                    } else {
                        // URL이 없으면 기본 이미지로 설정
                        profileImageUrl = null;
                    }

                    // AsyncStorage에 저장
                    await AsyncStorage.setItem(
                        'profileImageUri',
                        profileImageUrl || '' // null이면 빈 문자열로 저장
                    );

                    // 프로필 이미지 상태 설정
                    setUserAvatar(profileImageUrl ? { uri: profileImageUrl } : BambooPanda);
                } else {
                    // 서버에서 사용자 정보를 가져올 수 없는 경우 기본 이미지 사용
                    setUserAvatar(BambooPanda);
                }
            } catch (error) {
                console.error('프로필 정보 로드 중 오류:', error);
                setUserAvatar(BambooPanda); // 오류 발생 시 기본 이미지 사용
            }
        };

        fetchData();
    }, []);


    useFocusEffect(
        React.useCallback(() => {
            const fetchProfileImage = async () => {
                const storedImageUri = await AsyncStorage.getItem('profileImageUri');

                // URL이 없으면 기본 이미지 사용
                const imageUri = storedImageUri || BambooPanda;

                setUserAvatar(imageUri ? { uri: imageUri } : BambooPanda);
            };

            fetchProfileImage();

            // 포커스될 때마다 스크롤을 맨 아래로 이동
            if (scrollViewRef.current) {
                scrollViewRef.current.scrollToEnd({ animated: true });
            }
        }, [])
    );



    // 초기 로딩용 useEffect
// 입력 중 애니메이션 관리
    useEffect(() => {
        if (isTyping) {
            const typingInterval = setInterval(() => {
                setTypingDots((prev) => {
                    if (prev === '...') return ''; // 3개의 점이 채워지면 초기화
                    return prev + '.'; // 점 추가
                });
            }, 500); // 0.5초 간격으로 점 애니메이션 업데이트

            return () => clearInterval(typingInterval); // 컴포넌트가 언마운트될 때 정리
        } else {
            setTypingDots(''); // 애니메이션 초기화
        }
    }, [isTyping]);


    // 새로운 useEffect 추가하여 DB에서 채팅 기록 가져오기
    useEffect(() => {
        if (!userNick || !chatbotName) return;

        // DB에서 채팅 기록 가져오기
        const loadChatHistory = async () => {
            try {
                const chatHistory = await getChatHistory();
                const formattedMessages = chatHistory.map((chat: ChatMessage) => ({
                    sender: chat.chatter === 'bot' ? 'bot' : 'user',
                    text: chat.chatContent,
                    avatar: chat.chatter === 'bot' ? BambooHead : userAvatar,
                    name: chat.chatter === 'bot' ? chatbotName : userNick,
                    timestamp: new Date(chat.createdAt).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                    }),
                    createdAt: new Date(chat.createdAt).toLocaleDateString('ko-KR'),
                    showTimestamp: true,
                    evaluation: chat.evaluation,
                    chatIdx: chat.chatIdx
                }));

                setMessages(updateTimestamps(formattedMessages));
            } catch (error) {
                console.error('Failed to load chat history:', error);
            }
        };

        // 초기 로드
        loadChatHistory();

        // 이벤트를 통한 데이터 리로딩
        const reloadListener = () => {
            console.log('Reloading chat history...');
            loadChatHistory();
        };

        eventEmitter.on('reloadChatHistory', reloadListener);

        return () => {
            eventEmitter.off('reloadChatHistory', reloadListener); // 이벤트 해제
        };
    }, [userNick, chatbotName, userAvatar]);



    // 평가 처리 함수
    const handleEvaluation = async (messageIndex: number, type: 'like' | 'dislike') => {
        const messageToUpdate = messages[messageIndex];
        const newEvaluation = messageToUpdate.evaluation === type ? null : type;

        // 메시지 상태 업데이트
        setMessages(prevMessages =>
            prevMessages.map((msg, index) => {
                if (index === messageIndex && msg.sender === 'bot') {
                    return {...msg, evaluation: newEvaluation};
                }
                return msg;
            })
        );

        // DB 업데이트 요청
        try {
            await axios.put(`${serverAddress}/api/chat/updateEvaluation`, {
                chatIdx: messageToUpdate.chatIdx,
                evaluation: newEvaluation
            });
            console.log('Evaluation updated in DB:', newEvaluation);
        } catch (error) {
            console.error('Failed to update evaluation in DB:', error);
        }
    };

    useEffect(() => {
        if (scrollViewRef.current && messages.length > 0) {
            scrollViewRef.current.scrollToEnd({animated: true});
        }
    }, [messages]);

    // 카운트다운 시작 함수
    const startCountdown = () => {
        stopCountdown(); // 기존 카운트다운 중지
        setIsCountdownStarted(true); // 카운트다운 시작 상태 설정
        setIsTyping(true); // 입력 시 typing 상태 초기화
        let countdown = countdownDuration;
        console.log(`[Countdown] 시작: ${countdown}초 남음`);

        countdownIntervalRef.current = setInterval(() => {
            countdown -= 1;
            console.log(`[Countdown] ${countdown}초 남음`);

            if (countdown <= 0) {
                clearInterval(countdownIntervalRef.current!);
                countdownIntervalRef.current = null;
                console.log("[Countdown] 종료. 메시지 전송.");
                sendBotResponse(); // 챗봇에게 메시지 전송
            }
        }, 1000);
    };

// 카운트다운 중지 함수
    const stopCountdown = () => {
        setIsTyping(false); // 입력 시 typing 상태 초기화
        if (countdownIntervalRef.current !== null) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
            console.log("[Countdown] 중지");
        }
    };



    // 챗봇 응답 전송 함수
    const sendBotResponse = async () => {
        if (messagesToSendRef.current.length === 0) return;

        const combinedMessages = messagesToSendRef.current.join(" ");
        const croomIdx = await AsyncStorage.getItem("croomIdx");
        if (!croomIdx) {
            console.error("croomIdx not found in AsyncStorage");
            return;
        }

        const payload = {
            userEmail: userEmail,
            croomIdx: parseInt(croomIdx),
            chatter: "user",
            chatContent: combinedMessages,
        };

        try {
            console.log("Payload before sending to server:", payload);

            const response = await axios.post(serverUrl, payload, {
                headers: { "Content-Type": "application/json" },
            });

            console.log("Bot response:", response.data);

            const botMessages = response.data.chatContent.split("[LB]").map((msg, subIdx) => ({
                sender: "bot",
                text: msg.trim(),
                avatar: BambooHead,
                name: chatbotName,
                timestamp: getCurrentTime(),
                showTimestamp: true,
                chatIdx: response.data.chatIdx, // 서버에서 받은 chatIdx
                subIdx, // 추가: 분리된 메시지의 고유 인덱스
            }));

            // 메시지 추가
            botMessages.forEach((message, index) => {
                setTimeout(() => {
                    setMessages((prevMessages) => updateTimestamps([...prevMessages, message]));

                    // 마지막 메시지가 출력되면 세션 종료
                    if (index === botMessages.length - 1) {
                        stopCountdown();
                        setIsCountdownStarted(false);
                        setIsActiveSession(false);
                    }
                }, index * 1000); // 메시지 간 지연 시간 (1000ms = 1초)
            });

            messagesToSendRef.current = [];
        } catch (error) {
            console.error("Error sending bot response:", error);
        }
    };








    // 입력 필드 변경 핸들러
    const handleInputChange = (text: string) => {
        setInput(text);
        setIsTyping(false); // 입력 시 typing 상태 초기화

        if (!isActiveSession) {
            // console.log("[Countdown] 세션이 비활성화 상태. 입력 무시.");
            return;
        }

        if (text.trim() === "") {
            // 입력 필드가 비어 있는 경우
            if (!isCountdownStarted) {
                // 카운트다운이 시작되지 않은 경우에만 시작
                startCountdown();
                setIsCountdownStarted(true);
                console.log("[Countdown] 입력 필드가 비어있음. 카운트다운 시작.");
            }
        } else {
            // 입력 중인 경우
            if (isCountdownStarted) {
                stopCountdown();
                setIsCountdownStarted(false);
                console.log("[Countdown] 입력 중. 카운트다운 중지.");
            }
        }
    };



// 메시지 전송 함수
    const sendMessage = async () => {
        if (input.trim()) {
            const userMessage: Message = {
                sender: "user",
                text: input.trim(),
                avatar: userAvatar, // 사용자 아바타를 추가
                name: userNick,
                timestamp: new Date().toLocaleTimeString("ko-KR", {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
                createdAt: new Date().toLocaleDateString("ko-KR"),
                showTimestamp: true,
            };

            console.log("User message being sent:", userMessage);
            setMessages((prevMessages) =>
                updateTimestamps([...prevMessages, userMessage])
            );

            // 메시지 배열에 `[LB]` 포함하여 추가
            messagesToSendRef.current.push(input.trim() + " [LB]");
            setInput("");

            // 세션 활성화 및 카운트다운 시작
            setIsActiveSession(true); // 세션 활성화
            startCountdown(); // 카운트다운 시작
            setIsCountdownStarted(true);
            console.log("[Session] 세션 활성화됨.");
        }
    };


    const getCurrentTime = (): string => {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? '오후' : '오전';
        hours = hours % 12 || 12;
        return `${ampm} ${hours}:${minutes}`;
    };

    const updateTimestamps = (messages: Message[]): Message[] => {
        return messages.map((msg, index) => {
            const isLastMessageOfSender =
                index === messages.length - 1 || // 전체 메시지의 마지막 메시지
                messages[index + 1]?.sender !== msg.sender; // 다음 메시지가 다른 발신자의 메시지인지 확인

            return {
                ...msg,
                showTimestamp: isLastMessageOfSender, // 발신자 그룹의 마지막 메시지에만 시간 표시
            };
        });
    };



    const shouldShowTimestamp = (messageIndex: number, currentMessage: Message, allMessages: Message[]): boolean => {
        const nextMessage = allMessages[messageIndex + 1];

        // 다음 메시지가 없으면 현재 메시지에 시간을 표시
        if (!nextMessage) return true;

        // 다음 메시지가 동일한 분에 보낸 메시지라면 현재 메시지에서는 시간을 숨김
        if (nextMessage.timestamp === currentMessage.timestamp) return false;

        // 다른 분에 보낸 메시지라면 시간을 표시
        return true;
    };


    // 평가 버튼 컴포넌트
    const EvaluationButtons = ({ message, index }: { message: Message; index: number }) => {
        if (message.sender !== "bot") return null;

        // 현재 메시지가 응답의 마지막 말풍선인지 확인
        const isLastMessage = messages[index + 1]?.sender !== "bot";

        if (!isLastMessage) return null; // 마지막 메시지가 아니면 평가 버튼을 렌더링하지 않음

        return (
            <View style={styles.evaluationContainer}>
                <TouchableOpacity
                    onPress={() => handleEvaluation(index, "like")}
                    style={[
                        styles.evaluationButton,
                        message.evaluation === "like" && styles.evaluationButtonActive,
                    ]}
                >
                    <Ionicons
                        name={message.evaluation === "like" ? "thumbs-up" : "thumbs-up-outline"}
                        size={14}
                        color={message.evaluation === "like" ? "#4a9960" : "#666"}
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => handleEvaluation(index, "dislike")}
                    style={[
                        styles.evaluationButton,
                        message.evaluation === "dislike" && styles.evaluationButtonActive,
                    ]}
                >
                    <Ionicons
                        name={message.evaluation === "dislike" ? "thumbs-down" : "thumbs-down-outline"}
                        size={14}
                        color={message.evaluation === "dislike" ? "#e74c3c" : "#666"}
                    />
                </TouchableOpacity>
            </View>
        );
    };

    const renderDateHeaders = () => {
        let lastDate = ''; // 마지막 날짜 초기화

        return messages.map((msg, index) => {
            const currentDate = msg.createdAt || '';
            const showDateHeader = currentDate && currentDate !== lastDate;

            // 날짜 헤더가 렌더링될 때만 마지막 날짜를 업데이트
            if (showDateHeader) {
                lastDate = currentDate;
            }

            const isFirstMessage =
                (msg.sender === 'bot' && (index === 0 || messages[index - 1]?.sender !== 'bot')) ||
                (msg.sender === 'user' && (index === 0 || messages[index - 1]?.sender !== 'user'));
            // 사용자의 마지막 메시지 이후 챗봇의 첫 번째 메시지인지 확인
            const isFirstResponseFromBot =
                msg.sender === 'bot' &&
                index > 0 &&
                messages[index - 1]?.sender === 'user';
            return (
                <React.Fragment key={index}>
                    {showDateHeader && (
                        <View style={styles.dateHeaderContainer}>
                            <Text style={styles.dateHeader}>{currentDate}</Text>
                        </View>
                    )}

                    <TouchableOpacity
                        onLongPress={() => handleLongPress(msg, index)}
                        style={[
                            styles.messageContainer,
                            msg.sender === 'user' ? styles.userMessageContainer : styles.botMessageContainer,
                            !isFirstMessage && msg.sender === 'bot' ? styles.botMessageNotFirst : {},
                            !isFirstMessage && msg.sender === 'user' ? styles.userMessageNotFirst : {},
                            isFirstResponseFromBot && styles.firstBotResponseSpacing,
                        ]}
                    >
                        {isFirstMessage && (
                            <View style={[styles.avatarContainer, msg.sender === 'user' && styles.userAvatarPosition]}>
                                <Image
                                    source={typeof msg.avatar === 'string' ? { uri: msg.avatar } : msg.avatar}
                                    style={msg.sender === 'user' ? styles.userAvatar : styles.botAvatar}
                                />
                            </View>
                        )}

                        <View style={[
                            styles.messageContent,
                            msg.sender === 'user' ? styles.userMessageContent : styles.botMessageContent,
                        ]}>
                            {isFirstMessage && (
                                <Text style={[
                                    styles.senderName,
                                    msg.sender === 'user' ? styles.userSenderName : styles.botSenderName,
                                ]}>
                                    {msg.name}
                                </Text>
                            )}

                            <View style={styles.messageTimeContainer}>
                                {msg.sender === 'user' && msg.showTimestamp && (
                                    <Text style={styles.timeText}>{msg.timestamp}</Text>
                                )}

                                <View style={[
                                    styles.message,
                                    msg.sender === 'user' ? styles.userMessage : styles.botMessage,
                                    !isFirstMessage && msg.sender === 'bot' ? styles.botMessageNotFirst : {},
                                    !isFirstMessage && msg.sender === 'user' ? styles.userMessageNotFirst : {},
                                ]}>
                                    <Text style={[
                                        styles.messageText,
                                        msg.sender === 'user' ? styles.userMessageText : styles.botMessageText,
                                    ]}>
                                        {msg.text}
                                    </Text>
                                </View>

                                {msg.sender === 'bot' && msg.showTimestamp && (
                                    <View style={styles.timeContainer}>
                                        <EvaluationButtons message={msg} index={index} />
                                        <Text style={styles.timeText}>{msg.timestamp}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </TouchableOpacity>
                </React.Fragment>
            );
        });
    };

    useEffect(() => {
        // 모든 메시지가 렌더링된 뒤 스크롤 하단 이동
        const timer = setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: false });
        }, 0); // 스크롤 이동 딜레이 설정
        return () => clearTimeout(timer);
    }, [messages]); // 메시지가 변경될 때 실행

    return (

        <KeyboardAvoidingView
            style={{flex: 1}}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
            <View style={styles.container}>
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.chatArea}
                    contentContainerStyle={[styles.chatContent, {paddingBottom: height * 0.02}]} // 입력창 높이만큼 여유 공간 추가
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() => {
                        if (isAutoScrollEnabled) {
                            scrollViewRef.current?.scrollToEnd({animated: true});
                        }
                    }}
                    onScroll={handleScroll}
                    scrollEventThrottle={16} // 스크롤 이벤트 업데이트 빈도를 조절하여 성능 최적화
                >
                    {renderDateHeaders()}

                    {/* 챗봇이 응답을 작성 중일 때 점 애니메이션 표시 */}
                    {isTyping && (
                        <View style={[styles.messageContainer, styles.botMessageContainer]}>
                            {/* 챗봇 프로필 이미지 */}
                            <View style={styles.avatarContainer}>
                                <Image source={BambooHead} style={styles.botAvatar} />
                            </View>

                            {/* 챗봇 타이핑 애니메이션 */}
                            <View style={[styles.messageContent, styles.botMessageContent]}>
                                <View style={styles.typingIndicator}>
                                    <View style={styles.dotsContainer}>
                                        <Animated.View style={[styles.dot, { opacity: dotOpacity1 }]} />
                                        <Animated.View style={[styles.dot, { opacity: dotOpacity2 }]} />
                                        <Animated.View style={[styles.dot, { opacity: dotOpacity3 }]} />
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}

                </ScrollView>
                <View style={[styles.inputContainer, {marginTop: -height * 0.02}]}>
                    <TextInput
                        style={styles.input}
                        value={input}
                        onChangeText={handleInputChange}
                        placeholder="이야기 입력하기.."
                        placeholderTextColor="#707070"
                        multiline={true}
                        minHeight={height * 0.044}  // 최소 높이
                        maxHeight={height * 0.2}   // 최대 높이
                        onContentSizeChange={() => {
                            scrollViewRef.current?.scrollToEnd({animated: true});
                        }}
                    />
                    <TouchableOpacity style={styles.iconButton} onPress={sendMessage}>
                        <Ionicons name="arrow-up" size={20} color="#fff"/>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}
const styles = StyleSheet.create({
    dateHeaderContainer: {
        backgroundColor: 'rgba(128, 128, 128, 0.2)', // 반투명 회색 배경
        marginVertical: 40, // 상하 여백 축소
        paddingVertical: 5, // 상하 패딩
        paddingHorizontal: 25, // 좌우 패딩 추가
        borderRadius: 15, // 둥근 테두리
        alignSelf: 'center', // 가운데 정렬
    },
    firstBotResponseSpacing: {
        marginTop: 20, // 원하는 간격 크기 (20px)
    },
    dateHeader: {
        textAlign: 'center',
        color: '#555', // 텍스트 색상 지정
        fontSize: 14, // 텍스트 크기 조정
    },
    // 시간과 평가 버튼을 함께 감싸는 컨테이너
    dotsContainer: {
        flexDirection: 'row', // 가로 정렬
        justifyContent: 'center', // 가운데 정렬
        alignItems: 'center', // 세로 정렬
    },
    typingIndicator: {
        borderRadius: 15,
        paddingHorizontal: 12,
        paddingVertical: 8,
        alignSelf: 'flex-start',
        maxWidth: '60%',
        marginTop: 10,
    },

    dot: {
        width: 3,
        height: 3,
        marginHorizontal: 3,
        backgroundColor: '#a5aaa3',
        borderRadius: 3,
        opacity: 0.4,
        animation: 'bounce 1.5s infinite',
        transform: [{ scale: 1.2 }], // 확대 효과
    },

    timeContainer: {
        flexDirection: 'column', // 평가 버튼과 시간을 세로로 정렬
        alignItems: 'flex-start', // 왼쪽 정렬
        gap: 2, // 평가 버튼과 시간 사이 간격
    },

    // 평가 버튼을 감싸는 컨테이너
    evaluationContainer: {
        flexDirection: 'row', // 버튼들을 가로로 정렬
        alignItems: 'center', // 버튼들을 수직으로 중앙 정렬
        backgroundColor: 'white', // 배경색 흰색
        borderRadius: 12, // 모서리 둥글게
        padding: 2, // 내부 여백
        marginBottom: -8, // 시간과의 세로 간격
        shadowColor: "#000", // 그림자 색상
        left: -5,
        top:2,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.18,
        shadowRadius: 1.0,
        elevation: 1,
    },
    // 평가 버튼의 스타일
    evaluationButton: {
        padding: 2,
        marginHorizontal: 2,
    },

    // 활성화된 평가 버튼의 스타일
    evaluationButtonActive: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,

    },

    // 메시지와 시간 텍스트를 감싸는 컨테이너
    messageTimeContainer: {
        flexDirection: 'row', // 시간과 메시지를 가로로 정렬
        alignItems: 'flex-end', // 메시지를 수직으로 아래 정렬
        gap: 0, // 요소 간 간격 설정
        marginTop: -3, // 이름과의 간격을 좁히기 위해 위치를 위로 조정
    },

    // 메시지 시간 텍스트 스타일
    timeText: {
        fontSize: 12, // 텍스트 크기
        color: '#999', // 텍스트 색상
        marginTop: 2, // 평가 버튼과의 간격
        left: -5,
        top:8
    },

    // 메시지의 기본 스타일
    message: {
        padding: 10, // 내부 여백
        borderRadius: 15, // 둥근 모서리 적용
        maxWidth: '100%', // 최대 너비 100%
    },
    botMessageNotFirst: {
        marginLeft: 10, // 봇의 첫 번째 메시지가 아닐 때 여백 추가
        borderTopLeftRadius: 15, // 말꼬리 스타일 제거를 위한 둥근 모서리 설정
        borderBottomLeftRadius: 15,
    },
    userMessageNotFirst: {
        marginRight: 13, // 사용자의 첫 번째 메시지가 아닐 때 여백 추가
        borderTopRightRadius: 15, // 말꼬리 스타일 제거를 위한 둥근 모서리 설정
        borderBottomRightRadius: 15,
    },
    // 사용자 메시지의 스타일
    userMessage: {
        backgroundColor: '#4a9960', // 사용자 메시지 배경색
        marginLeft: 5,  // 말풍선 꼬리 공간 확보
        borderTopRightRadius: 3, // 오른쪽 상단 모서리를 더 둥글게
        top: 5,
        left: -8,
    },

    // 전체 컨테이너 스타일
    container: {
        flex: 1, // 화면을 가득 채움
        backgroundColor: '#FFFFFF', // 배경색 흰색
        justifyContent: 'center', // 세로 중앙 정렬
        alignItems: 'center', // 가로 중앙 정렬
    },

    // 채팅 영역 스타일
    chatArea: {
        flex: 1, // 화면을 가득 채움
        padding: 8, // 내부 여백
        width: '100%', // 전체 너비 사용
        marginBottom:15
    },

    // 메시지 컨테이너 스타일
    messageContainer: {
        flexDirection: 'row', // 메시지와 아바타를 가로로 정렬
        alignItems: 'flex-start', // 수직으로 위쪽 정렬
        marginVertical: 2, // 위아래 여백
        marginBottom: 4, // 메시지 간격
        paddingHorizontal: 6, // 좌우 여백
        position: 'relative', // 자식 요소의 위치 설정
    },

    // 사용자 메시지 컨테이너 스타일
    userMessageContainer: {
        flexDirection: 'row-reverse', // 사용자 메시지를 오른쪽으로 정렬
        justifyContent: 'flex-start',
        marginRight:-15
    },
    // 봇 메시지 컨테이너 스타일
    botMessageContainer: {
        flexDirection: 'row', // 챗봇 메시지를 왼쪽으로 정렬
        justifyContent: 'flex-start',
        marginLeft:-15
    },

    // 아바타 컨테이너 스타일
    avatarContainer: {
        width: 36, // 아바타 너비
        height: 36, // 아바타 높이
        borderRadius: 18, // 원형 모양
        overflow: 'hidden', // 넘치는 부분을 숨김
        justifyContent:'center',
        alignItems:'center'
    },

    // 사용자 아바타 이미지 스타일
    userAvatar: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover', // 사용자가 설정한 프로필 사진에 맞춰서 조정
        borderRadius: 15, // 원형으로 조정
    },

    // 챗봇 아바타 이미지 스타일
    botAvatar: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain', // 기본 이미지에 맞춰 조정
        borderRadius: 15, // 사각형에 더 가까운 스타일
        justifyContent:'center',
        alignItems:'center',
    },

    // 메시지 컨텐츠 스타일
    messageContent: {
        maxWidth: '70%', // 메시지 최대 너비
        marginHorizontal: -3, // 좌우 마진
        position: 'relative', // 자식 요소의 위치 설정
    },

    // 사용자 메시지 컨텐츠 정렬 스타일
    userMessageContent: {
        alignItems: 'flex-end', // 오른쪽 정렬
    },

    // 봇 메시지 컨텐츠 정렬 스타일
    botMessageContent: {
        alignItems: 'flex-start', // 왼쪽 정렬
    },

    // 채팅 컨텐츠 스타일
    chatContent: {
        paddingVertical: 1, // 위아래 여백
        flexGrow: 1, // 컨텐츠가 적을 때도 스크롤 가능하도록
    },

    // 봇 메시지 컨텐츠 정렬 스타일
    botMessage: {
        backgroundColor: '#ECECEC', // 배경색 설정
        marginRight: 12, // 말풍선 꼬리 공간 확보
        borderTopLeftRadius: 3, // 왼쪽 상단 모서리를 더 둥글게
        top: 5, // 기본 위치 설정 (위치 조정이 필요한 경우 수정)
        left:4
    },

    // 발신자 이름 텍스트 스타일
    senderName: {
        fontSize: 12, // 텍스트 크기
        fontWeight: 'bold', // 텍스트 두껍게
        color: '#555', // 텍스트 색상
        paddingLeft: 5, // 말풍선 꼬리 공간 확보
        left: -5,
    },

    // 봇 발신자 이름 정렬 스타일
    botSenderName: {
      left: 1,
    },

    // 사용자 발신자 이름 정렬 스타일
    userSenderName: {
      top:1.2,
      left:-8
    },



    // 사용자 메시지 텍스트 색상
    userMessageText: {
        color: '#FFFFFF', // 흰색 텍스트
    },

    // 봇 메시지 텍스트 색상
    botMessageText: {
        color: '#000000', // 검은색 텍스트
    },

    // 입력 영역 스타일
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end', // 입력 칸이 위로 확장될 때 하단 정렬 유지
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: '#fff',
        width: '100%',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 10,
        fontSize: 16,
        textAlignVertical: 'center', // 텍스트 상단 정렬
    },
    iconButton: {
        backgroundColor: '#4a9960',
        borderRadius: 25,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    userAvatarPosition: {
        marginRight: 5, // 오른쪽 여백 추가
    },
    botAvatarPosition: {
        marginLeft: 5, // 왼쪽 여백 추가
    },


});
