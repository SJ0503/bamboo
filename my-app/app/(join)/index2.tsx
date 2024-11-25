import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  TextInput,
  Image,
  Animated,
  StyleSheet,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import JoinBG from '../../components/JoinBG';
import SmoothCurvedButton from '../../components/SmoothCurvedButton';
import SmoothCurvedView from '../../components/SmoothCurvedView';
import SmoothCurvedInput from '../../components/SmoothCurvedInput';

const KeywordSelectionScreen = () => {
  const router = useRouter();
  const { userData: initialUserData } = useLocalSearchParams();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [testResults, setTestResults] = useState<string>('');
  const [chatbotName, setChatbotName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
   // 비율 계산 및 cloudTopPosition 설정
  const aspectRatio = screenWidth / screenHeight;
  const cloudTopPosition = aspectRatio >= 0.6 ? '40%' : '50%';

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const cloudAnim = useRef(new Animated.Value(1)).current;
  const cloudScale = useRef(new Animated.Value(0.1)).current;
  const chatbotScale = useRef(new Animated.Value(0)).current;

  const scrollViewRef = useRef<ScrollView>(null);

  const questions = [
    // 외향/내향 (E/I)
    {
      question: "밤부의 성격을 형성하는 단계입니다.\n답변을 선택해주세요.",
      aiResponse: "당신이 새로운 사람과 만날 때, 어떻게 느끼시나요?",
      responses: [
        { text: "재미있고 활기찬 시간을 기대한다", value: "0" }, // 외향
        { text: "약간 부담스럽고 긴장된다", value: "1" },      // 내향
      ],
    },
    {
      question: "다음 질문입니다.\n어떻게 생각하시나요?",
      aiResponse: "처음 가본 낯선 곳에서 시간 보낼 때,",
      responses: [
        { text: "이곳저곳 탐험하고 싶다", value: "0" },  // 외향
        { text: "조용히 내 시간을 보낸다", value: "1" }, // 내향
      ],
    },
    {
      question: "다음 질문입니다.\n어떻게 생각하시나요?",
      aiResponse: "팀 프로젝트가 주어졌을 때, 나는",
      responses: [
        { text: "사람들과 적극적으로 의견을 나눈다", value: "0" }, // 외향
        { text: "조용히 맡은 부분을 처리한다", value: "1" },      // 내향
      ],
    },
    // 공감/논리 (F/T)
    {
      question: "다음 질문입니다.\n어떻게 생각하시나요?",
      aiResponse: "친구가 고민을 이야기할 때, 나는",
      responses: [
        { text: "상대방의 감정을 공감하며 위로한다", value: "0" }, // 공감
        { text: "상황을 객관적으로 분석하며 조언한다", value: "1" }, // 논리
      ],
    },
    {
      question: "다음 질문입니다.\n어떻게 생각하시나요?",
      aiResponse: "무인도에 떨어졌을 때, 나는",
      responses: [
        { text: "함께 살아남을 방법을 고민한다", value: "0" }, // 공감
        { text: "혼자 생존을 위한 방안을 마련한다", value: "1" }, // 논리
      ],
    },
    {
      question: "다음 질문입니다.\n어떻게 생각하시나요?",
      aiResponse: "실수를 했을 때, 나는",
      responses: [
        { text: "상대방의 감정을 헤아리며 사과한다", value: "0" }, // 공감
        { text: "상황을 분석하고 개선 방안을 제시한다", value: "1" }, // 논리
      ],
    },
    {
      question: "다음 질문입니다.\n어떻게 생각하시나요?",
      aiResponse: "누군가가 도움을 요청할 때, 나는",
      responses: [
        { text: "당연히 돕고 싶다", value: "0" }, // 공감
        { text: "신중하게 판단한 후 돕는다", value: "1" }, // 논리
      ],
    },
    {
      question: "마지막 질문입니다.\n어떻게 생각하시나요?",
      aiResponse: "사람들과의 갈등 상황에서, 나는",
      responses: [
        { text: "상대방의 입장을 이해하며 대화한다", value: "0" }, // 공감
        { text: "상황을 객관적으로 정리하며 논리적으로 해결한다", value: "1" }, // 논리
      ],
    },
    // 마지막 이름 입력
    {
      question: "밤부의 이름을 지어주세요",
      aiResponse: "좋은 이름을 기대할게요!",
      responses: [],
    },
  ];


  const validIndex = Math.min(Math.max(currentQuestionIndex, 0), questions.length - 1);
  const currentQuestion = questions[validIndex];
  const isLastQuestion = validIndex === questions.length - 1;

  const handleSelectResult = (value: '0' | '1') => {
    setTestResults((prevResults) => prevResults + value);
  };

  const startChatbotAnimation = () => {
    chatbotScale.setValue(0);
    Animated.timing(chatbotScale, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  };

  const hideChatbotAnimation = (callback: () => void) => {
    Animated.timing(chatbotScale, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(callback);
  };

  const animateFade = (toValue, duration, callback) => {
    Animated.timing(fadeAnim, {
      toValue: toValue,
      duration: duration,
      useNativeDriver: true,
    }).start(callback);
  };

  const handleResponsePress = (index: number) => {
    if (isProcessing) return;
    setIsProcessing(true);
    handleSelectResult(index === 0 ? '0' : '1');
    if (currentQuestionIndex === questions.length - 2) {
      startCloudAnimation();
    }

    animateFade(0, 400, () => {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      fadeAnim.setValue(0);

      animateFade(1, 500, () => setIsProcessing(false));

      updateCloudScale(currentQuestionIndex + 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    });
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      if (currentQuestionIndex === questions.length - 1) {
        cloudAnim.setValue(1);
        hideChatbotAnimation(() => {
          animateFade(0, 400, () => {
            const newIndex = currentQuestionIndex - 1;
            setCurrentQuestionIndex(newIndex);
            fadeAnim.setValue(0);

            animateFade(1, 500, () => setIsProcessing(false));

            updateCloudScale(newIndex);
          });
        });
      } else {
        animateFade(0, 400, () => {
          const newIndex = currentQuestionIndex - 1;
          setCurrentQuestionIndex(newIndex);
          fadeAnim.setValue(0);

          animateFade(1, 500, () => setIsProcessing(false));

          updateCloudScale(newIndex);
          scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        });
      }
    }
  };

  const startCloudAnimation = () => {
    Animated.timing(cloudAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const updateCloudScale = (index: number) => {
    let targetScale = 1;
    const aspectRatio = screenWidth / screenHeight; // 화면 비율 계산
    console.log(aspectRatio);
    const scaleLimits = aspectRatio >= 0.6
      ? [0.1, 0.15, 0.25, 0.35, 0.5, 0.7, 1.0, 1.3] // 비율이 0.6 이상일 때 스케일 값
      : [0.1, 0.2, 0.4, 0.5, 0.9, 1.4, 2.0, 2.7];  // 비율이 0.6 미만일 때 스케일 값

    if (index < scaleLimits.length) {
      targetScale = scaleLimits[index];
    } else {
      targetScale = scaleLimits[scaleLimits.length - 1];
    }

    Animated.timing(cloudScale, {
      toValue: targetScale,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  // 스타일 정의에서 조건부로 top 조절
  const dynamicStyles = (aspectRatio) => ({
    cloudContainer: {
      position: 'absolute',
      top: aspectRatio >= 0.6 ? '40%' : '50%', // 비율이 0.6 이상일 때 위치를 위로 올림
      alignSelf: 'center',
      zIndex: 1,
    },
  });

  useEffect(() => {
    if (isLastQuestion) {
      startChatbotAnimation();
    } else {
      chatbotScale.setValue(0);
    }
  }, [currentQuestionIndex]);
  console.log("2차 보낼 데이터",initialUserData,testResults, chatbotName)
  const handleConfirm = () => {
    if (chatbotName.trim()) {
      router.push({
        pathname: '/(join)/sendUserInfo',
        params: {
          userData: initialUserData, // 사용자 데이터 (e.g., 이메일)
          testResults,              // 응답 결과 (e.g., "01010101")
          chatbotName,              // 챗봇 이름
        },
      });
    } else {
      alert('챗봇 이름을 입력해주세요.');
    }
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      scrollViewRef.current?.scrollTo({ y: 200, animated: true });
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
return (
  <JoinBG>
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[
          styles.container,
          { paddingVertical: screenHeight * 0.05, paddingBottom: 200 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.chatBubble, { width: screenWidth * 0.8, top: -screenHeight * 0.04, }]}>
          <Text
              style={[
                styles.chatText,
                {
                  flexWrap: 'wrap', // 텍스트 줄바꿈
                  textAlign: 'center', // 텍스트 중앙 정렬
                }
              ]}
          >
            {currentQuestion.question}
          </Text>
        </View>

          <Animated.View
            style={[
              styles.aiResponse,
              { opacity: fadeAnim, top: -screenHeight * 0.05, opacity: fadeAnim || 0 }, // 초기 opacity 값 설정
            ]}
          >
            <SmoothCurvedView customWidth={screenWidth * 0.95} disabled={false} fill="#E4E0E130">
              {!isLastQuestion ? (
                <TouchableOpacity
                  onPress={() => !isProcessing && handleResponsePress(0)}
                  disabled={isProcessing}
                >
                  <Text style={styles.aiResponseText}>{currentQuestion.aiResponse}</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.aiResponseText}>{currentQuestion.aiResponse}</Text>
              )}
            </SmoothCurvedView>
          </Animated.View>


        {!isLastQuestion ? (
          <>
            <Animated.View
              style={[
                styles.cloudContainer,
                { top:cloudTopPosition,transform: [{ scale: cloudScale }], opacity: cloudAnim, width: screenWidth * 0.6, height: screenWidth * 0.3 },
              ]}
            >
              <Image source={require('../../assets/images/구름.png')} style={styles.cloudImage} resizeMode="contain" />
            </Animated.View>

            <View style={[styles.responseContainer,{gap:5, bottom:-screenHeight*0.007}]}>
              <View style={styles.progressContainer}>
                {questions.slice(0, -1).map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      currentQuestionIndex === index && styles.activeDot,
                    ]}
                  />
                ))}
              </View>

              // fadeAnim을 각 SmoothCurvedButton에 전달하여 버튼에 페이드 애니메이션 적용
              {currentQuestion.responses.map((response, index) => (
                  <Animated.View
                      key={index}
                      style={[
                          styles.responseButton,
                          {
                              opacity: fadeAnim,
                              width: screenWidth * 0.85,
                              position: 'relative',
                              zIndex: 2,
                          },
                      ]}
                  >
                      <SmoothCurvedButton
                          title={response.text} // response 객체에서 text를 추출하여 전달
                          onPress={() => !isProcessing && handleResponsePress(index)}
                          disabled={isProcessing}
                          customWidth={screenWidth * 0.95}
                      />
                  </Animated.View>
              ))}


                <TouchableOpacity
                  style={[
                    styles.back,
                    {
                      paddingHorizontal: screenWidth*0.4,
                      paddingVertical: screenHeight*0.03,
                    },
                    currentQuestionIndex > 0 ? {} : { opacity: 0 },
                  ]}
                  onPress={currentQuestionIndex > 0 ? handlePrevious : null}
                  disabled={isProcessing || currentQuestionIndex === 0}
                >
                  <Text style={[styles.navButtonText,{marginTop:-screenHeight*0.03}]}>이전</Text>
                </TouchableOpacity>


              </View>
          </>
        ) : (
          <View style={styles.lastQuestionContainer}>
            <View style={[styles.chatbotContainer, { top: '20%' }]}>
              <Animated.Image
                source={require('../../assets/images/밤부_머리1.png')}
                style={[styles.chatbotImage, { width: screenWidth * 0.4, height: screenWidth * 0.4, transform: [{ scale: chatbotScale }] }]}
                resizeMode="contain"
              />


              <View style={[styles.navigationButtons, { bottom: screenHeight*0.02,marginTop:50, justifyContent: 'center', gap:20 }]}>
              <Text style={[styles.warningText]}>밤부의 이름은 변경할 수 없습니다.‼️</Text>
              <SmoothCurvedInput
                value={chatbotName}
                onChangeText={setChatbotName}
                placeholder="밤부의 이름을 입력하세요"
                isFocused={isFocused}
                chatbotName={chatbotName}
              />
                {currentQuestionIndex > 0 && (
                  <SmoothCurvedButton
                    title="이전"
                    onPress={handlePrevious}
                    disabled={isProcessing}
                    style={{
                    }}
                  />
                )}
                <SmoothCurvedButton
                  title="확인"
                  onPress={handleConfirm}
                  disabled={!chatbotName.trim() || isProcessing}
                  style={{
                    opacity: chatbotName.trim() ? 1 : 0.6,
                  }}
                />
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  </JoinBG>
);

};

// 스타일 정의
const styles = StyleSheet.create({
  // 경고 텍스트 스타일: 경고 메시지를 빨간색으로 중앙 정렬하고, 상단에 약간의 여백을 추가하여 다른 요소와 분리
  warningText: {
    color: 'red',               // 텍스트 색상을 빨간색으로 설정
    textAlign: 'center',        // 텍스트를 중앙에 정렬
    fontSize: 14,               // 텍스트 크기를 14px로 설정
  },
  back:{

    },

  // 화면 전체 컨테이너 스타일: 스크롤 시 화면에 꽉 차도록 설정하고, 자식 요소를 중앙에 정렬
  container: {
    flexGrow: 1,                // 스크롤 뷰가 화면 전체를 채우도록 설정
    alignItems: 'center'        // 자식 요소를 수평 중앙으로 정렬
  },

  // 채팅 버블 스타일: 질문 또는 응답 텍스트를 감싸는 영역으로, 모서리를 둥글게 처리하여 버블 모양으로 설정
  chatBubble: {

    borderRadius: 30,           // 모서리를 둥글게 처리하여 버블 모양을 만듦
    paddingHorizontal: '4%',    // 수평 여백
    paddingVertical: '2%',      // 수직 여백
    marginBottom: '5%',         // 하단 여백 추가
    alignItems: 'center',       // 가로 축에서 내부 요소를 중앙 정렬
    justifyContent: 'center',   // 세로 축에서 내부 요소를 중앙 정렬
  },

  // 채팅 텍스트 스타일: 채팅 버블 안의 텍스트 스타일 설정
  chatText: {
    fontSize: 15,               // 텍스트 크기 설정
    color: '#000',              // 텍스트 색상 설정
    textAlign: 'center',        // 텍스트를 중앙 정렬
    flexWrap: 'wrap',           // 텍스트가 영역을 벗어나지 않도록 줄바꿈 허용
    lineHeight: 20,             // 줄 간격 설정으로 가독성 향상
    maxWidth: '90%',            // 버블 내부에서 텍스트가 최대 90% 크기까지만 차지하도록 제한

  },

  // 챗봇 컨테이너 스타일: 챗봇 이미지와 관련 요소들을 수직으로 중앙 정렬하고 여백 추가
  chatbotContainer: {
    alignItems: 'center',       // 자식 요소를 수평 중앙으로 정렬
  },

  // 챗봇 이미지 스타일: 챗봇 이미지를 화면에 표시하기 위한 스타일
  chatbotImage: {
    marginBottom: 30            // 이미지 하단에 20px 여백 추가하여 텍스트와의 간격 확보
  },

  // 응답 컨테이너 스타일: 사용자 응답 버튼들을 포함하는 영역
  responseContainer: {
    alignItems: 'center',       // 자식 요소들을 수평 중앙 정렬
    position: 'absolute',       // 화면의 고정된 위치에 배치
  },

  // AI 응답 스타일: AI가 생성한 응답을 표시할 때 사용하는 스타일
  aiResponse: {
    zIndex: 2,                  // 다른 요소 위에 표시되도록 z-index 설정
    alignItems:'center'
  },

  // AI 응답 버튼 스타일: AI 응답을 버튼 형태로 표시
  aiResponseButton: {
  },

  // 응답 버튼 터치 가능한 영역 스타일: 사용자 응답 버튼의 터치 가능한 영역
  responseButtonTouchable: {
  },

  // 구름 컨테이너 스타일: 애니메이션 효과가 적용된 구름 이미지 컨테이너
  cloudContainer: {
    position: 'absolute',       // 고정된 위치에 배치
    alignSelf: 'center',        // 구름을 화면 중앙에 배치
    zIndex: 1                   // 다른 요소 아래에 배치되도록 z-index 설정
  },

  // 구름 이미지 스타일: 구름 이미지 크기를 컨테이너에 맞춤
  cloudImage: {
    width: '100%',              // 이미지 너비를 컨테이너 너비에 맞춤
    height: '100%'              // 이미지 높이를 컨테이너 높이에 맞춤
  },

  // AI 응답 텍스트 스타일: AI 응답 텍스트의 폰트 크기 설정
  aiResponseText: {
    fontSize: 14               // 텍스트 크기를 16px로 설정하여 읽기 쉽게 표시
  },
  // 응답 버튼 스타일: 사용자 응답 옵션 버튼의 스타일
  responseButton: {
    marginBottom: '3%',         // 버튼 간격을 위해 하단에 3% 마진 추가
    justifyContent: 'center',   // 텍스트를 수직 중앙에 정렬
  },

  // 응답 텍스트 스타일: 응답 텍스트의 폰트 크기와 정렬 설정
  responseText: {
  },


  // 내비게이션 버튼 컨테이너 스타일: '이전' 및 '확인' 버튼들을 담고 있는 컨테이너
  navigationButtons: {
  },

  // 내비게이션 버튼 스타일: '이전' 및 '확인' 버튼의 외형 스타일
  navButton: {
  },


  // 내비게이션 버튼 텍스트 스타일: '이전' 및 '확인' 버튼 텍스트 스타일
  navButtonText: {
  },


  // 진행 상황 도트 컨테이너 스타일: 현재 진행 상황을 나타내는 도트들을 포함
  progressContainer: {
    flexDirection: 'row',       // 도트를 가로로 나란히 배치
    justifyContent: 'center',   // 도트를 중앙에 정렬
    alignItems: 'center',       // 도트를 수직 중앙에 정렬
    marginBottom: '5%',         // 하단에 5% 마진 추가
    marginTop: '-2%',            // 상단에 -2% 마진 추가하여 다른 요소와 간격 조정
  },

  // 비활성 도트 스타일: 기본 도트의 크기와 색상
  dot: {
    width: 8,                   // 도트의 너비를 8px로 설정
    height: 8,                  // 도트의 높이를 8px로 설정
    borderRadius: 4,            // 도트를 원형으로 만들기 위해 반지름 설정
    backgroundColor: '#E8E8E8', // 비활성 도트 배경색을 연회색으로 설정
    marginHorizontal: 4         // 도트 간의 간격을 위해 좌우에 4px 마진 추가
  },

  // 활성 도트 스타일: 현재 질문을 나타내는 활성 도트의 크기와 색상
  activeDot: {
    backgroundColor: '#4a9960', // 활성 도트 색상을 초록색으로 설정
    width: 10,                  // 활성 도트 너비를 10px로 설정하여 강조
    height: 10,                 // 활성 도트 높이를 10px로 설정
    borderRadius: 5             // 도트를 원형으로 만들기 위해 반지름 설정
  },
});

export default KeywordSelectionScreen;
