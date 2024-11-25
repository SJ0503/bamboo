import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
  Button,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Modal,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getUserInfo, clearUserData, getUserProfileImage, setUserProfileImage, saveUserInfo } from '../../storage/storageHelper';
import * as ImagePicker from 'expo-image-picker';
import SmoothCurvedButton from '../../components/SmoothCurvedButton';
import SmoothCurvedInput from '../../components/SmoothCurvedInput';
import SmoothCurvedView from '../../components/SmoothCurvedView';
import {serverAddress} from '../../components/Config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useProfile } from '../../context/ProfileContext';

const profileImageBaseUrl = `${serverAddress}/uploads/profile/images/`;

const SettingsScreen = () => {
  const {width, height} = useWindowDimensions("");
  const router = useRouter();
  const [userInfo, setUserInfo] = useState(null);
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const { setProfileImageUri } = useProfile();
  const [profileImageUri, setProfileImageUriState] = useState(null);
  const [isChanged, setIsChanged] = useState(false); // 변경 여부 상태

// 사용자 데이터 불러오기
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const data = await getUserInfo();
        if (data) {
          const profileImageUrl = data.profileImage
            ? `${data.profileImage}?${new Date().getTime()}`
            : null;
          const updatedUserInfo = { ...data, profileImage: profileImageUrl };

          setUserInfo(updatedUserInfo);
          setProfileImageUriState(profileImageUrl);
          setNotificationsEnabled(data.notificationsEnabled);
          await AsyncStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
        } else {
          setUserInfo(null);
          setProfileImageUriState(null);
          Alert.alert("오류", "사용자 정보를 불러올 수 없습니다.");
        }
      } catch (error) {
        console.error('사용자 정보 불러오기 중 오류:', error);
        Alert.alert("오류", "사용자 정보를 불러오는 중 문제가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, []);

useEffect(() => {
  const loadUserData = async () => {
    try {
      const storedUserInfo = await AsyncStorage.getItem('userInfo');
      if (storedUserInfo) {
        setUserInfo(JSON.parse(storedUserInfo));
      }
    } catch (error) {
      console.error('Error loading user data from AsyncStorage:', error);
    }

    try {
      const storedNotificationSetting = await AsyncStorage.getItem('notificationsEnabled');
      if (storedNotificationSetting) {
        setNotificationsEnabled(JSON.parse(storedNotificationSetting)); // 알림 설정 로드
      }
    } catch (error) {
      console.error('Error loading notification setting from AsyncStorage:', error);
    }

    setIsLoading(false);
  };

  loadUserData(); // 사용자 데이터 및 알림 설정 불러오기
}, []);

// 알림 설정 변경을 감지하여 초기 설정과 다른 경우 isChanged를 업데이트하는 useEffect 추가
useEffect(() => {
  if (userInfo && notificationsEnabled !== userInfo.notificationsEnabled) {
    setIsChanged(true);
  } else {
    setIsChanged(false);
  }
}, [notificationsEnabled, userInfo]);


  const handleImagePicker = () => {
    setModalVisible(true);
  };

 // 프로필 이미지 선택 및 업로드
  const handleImageSelect = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("알림", "갤러리에 접근하기 위해 권한이 필요합니다.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'Images', allowsEditing: true, aspect: [1, 1], quality: 1,
      });
      if (!result.canceled && result.assets?.length > 0) {
        const selectedImageUri = result.assets[0].uri;
        const formData = new FormData();
        formData.append('photo', { uri: selectedImageUri, type: 'image/jpeg', name: 'profile.jpg' });
        formData.append('email', userInfo?.userEmail);

        const response = await axios.post(`${serverAddress}/api/users/uploadProfile`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (response.status === 200) {
          const serverImagePath = `${profileImageBaseUrl}${response.data.filePath}`;
          setProfileImageUri(serverImagePath); // Context 업데이트
          setProfileImageUriState(serverImagePath); // 로컬 상태 업데이트
          await AsyncStorage.setItem('userInfo', JSON.stringify({ ...userInfo, profileImage: serverImagePath }));
          Alert.alert("알림", "프로필 이미지가 성공적으로 업로드되었습니다.");
        }
      }
    } catch (error) {
      console.error("프로필 이미지 업로드 중 오류:", error);
      Alert.alert("오류", "이미지 업로드 중 문제가 발생했습니다.");
    } finally {
      setModalVisible(false);
    }
  };


// 기본 이미지 설정 함수에서 ProfileContext와 AsyncStorage를 모두 업데이트
const handleResetProfileImage = async () => {
    try {
        await axios.post(`${serverAddress}/api/users/resetProfileImage`, {
            userEmail: userInfo?.userEmail,
        });

        // 내부의 Panda 이미지 경로로 업데이트
        setProfileImageUri(null); // ProfileContext에서 null로 설정
        setProfileImageUriState(null); // 로컬 상태 업데이트
        await AsyncStorage.removeItem('profileImageUri'); // AsyncStorage에서도 이미지 경로 제거
        Alert.alert("알림", "프로필 이미지가 기본 아이콘으로 재설정되었습니다.");
    } catch (error) {
        console.error("프로필 이미지 재설정 중 오류:", error);
        Alert.alert("오류", "프로필 이미지를 재설정하는 중 문제가 발생했습니다.");
    }
    setModalVisible(false);
};


 const toggleSwitch = () => {
    setNotificationsEnabled((prev) => !prev);
  };
  const handleSave = async () => {
      let isPasswordChanged = false;

      console.log('저장 버튼 클릭됨');
      console.log('현재 비밀번호 입력값:', password);
      console.log('새 비밀번호 입력값:', newPassword);

      // 비밀번호 변경 절차
      if (newPassword) {
          if (!password) {
              Alert.alert('알림', '현재 비밀번호를 입력해 주세요.');
              console.log('오류: 현재 비밀번호가 입력되지 않음');
              return;
          }

          if (!isValidPassword(newPassword)) {
              Alert.alert('알림', '새 비밀번호는 최소 8자 이상, 영어와 숫자를 포함해야 합니다.');
              console.log('오류: 새 비밀번호 유효성 검사 실패');
              return;
          }

          try {
              // 현재 비밀번호가 맞는지 확인
              console.log('현재 비밀번호 확인 요청 시작');
              const response = await axios.post(`${serverAddress}/api/users/verifyPassword`, {
                  userEmail: userInfo?.userEmail,
                  userPw: password // 현재 비밀번호를 userPw 필드에 포함하여 전달
              });

              console.log('현재 비밀번호 확인 응답:', response.data);

              const isPasswordValid = response.data.isValid;
              if (isPasswordValid) {
                  console.log('현재 비밀번호 일치: 비밀번호 업데이트 요청 시작');
                  await updatePassword(newPassword);
                  Alert.alert('알림', '비밀번호가 성공적으로 변경되었습니다.');
                  setPassword('');
                  setNewPassword('');
                  isPasswordChanged = true;
              } else {
                  Alert.alert('알림', '현재 비밀번호가 올바르지 않습니다.');
                  console.log('오류: 현재 비밀번호 불일치');
                  return;
              }
          } catch (error) {
              console.error('비밀번호 확인 중 오류:', error);
              Alert.alert('오류', '비밀번호 확인 중 문제가 발생했습니다.');
              return;
          }
      }

      // 알림 설정 변경 절차
      if (isChanged) {
          try {
              console.log('알림 설정 업데이트 요청 시작');
              const notificationResponse = await updateNotificationSettings();
              console.log('알림 설정 업데이트 응답:', notificationResponse);
              if (notificationResponse) {
                  setUserInfo((prev) => ({ ...prev, notificationsEnabled }));
                  setIsChanged(false);
                  if (!isPasswordChanged) {
                      Alert.alert('알림', '설정이 저장되었습니다.');
                  }
              }
          } catch (error) {
              console.error('알림 설정 저장 중 오류:', error);
              Alert.alert('오류', '알림 설정 저장 중 문제가 발생했습니다.');
          }
      }

      if (!isChanged && !isPasswordChanged) {
          console.log("변경 사항 없음");
      }
  };



// 비밀번호 유효성 검사 (대문자 제외, 영어와 숫자 조합 8자리 이상)
const isValidPassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*\d)[a-z\d]{8,}$/i; // 영어와 숫자가 포함된 8자 이상의 비밀번호
    return passwordRegex.test(password);
};



// 비밀번호 업데이트 API 호출
const updatePassword = async (newPassword) => {
    const userData = { userEmail: userInfo?.userEmail, userPw: newPassword };
    const response = await axios.put(`${serverAddress}/api/users/updatePassword`, userData); // PUT 메서드 사용

    if (response.status === 200) {
        Alert.alert('알림', '비밀번호가 성공적으로 변경되었습니다.');
    } else {
        Alert.alert('오류', '비밀번호 변경에 실패했습니다.');
    }
};

// 알림 설정 업데이트
const updateNotificationSettings = async () => {
    try {
        const params = {
            userEmail: userInfo?.userEmail,
            toggle: notificationsEnabled,
            startTime: notificationsEnabled ? startTime : null,
            endTime: notificationsEnabled ? endTime : null,
        };

        const response = await axios.put(`${serverAddress}/api/users/updateNotificationSettings`, null, { params });

        if (response.status === 200) {
            // 알림 설정을 로컬 저장소에 저장
            await AsyncStorage.setItem('notificationsEnabled', JSON.stringify(notificationsEnabled));
            console.log("알림 설정 저장 성공");
            return true;
        } else {
            console.log("알림 설정 저장 실패");
            return false;
        }
    } catch (error) {
        console.error('알림 설정 저장 중 오류:', error);
        return false;
    }
};





  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a9960" />
        <Text>사용자 정보를 불러오는 중...</Text>
      </View>
    );
  }

  return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.profileImageSection}>
            <TouchableOpacity style={styles.profileImageContainer} onPress={handleImagePicker}>
              {profileImageUri ? (
                <Image source={{ uri: profileImageUri }} style={styles.profileImage} />
              ) : (
                <View style={styles.defaultProfileImage}>
                  <Ionicons name="person-outline" size={50} color="#cccccc" />
                </View>
              )}
              <View style={styles.cameraIconContainer}>
                <Ionicons name="camera" size={20} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>
            <Text style={styles.label}>닉네임</Text>
            <SmoothCurvedView style={[styles.input, { alignSelf: 'center' }]} customWidth={width * 0.95} fill="#f9f9f9">
              <Text style={styles.text}>{userInfo?.userNick || ''}</Text>
            </SmoothCurvedView>

            <Text style={styles.label}>이메일</Text>
            <SmoothCurvedView style={[styles.input, { alignSelf: 'center' }]} customWidth={width * 0.95} fill="#f9f9f9">
              <Text style={styles.text}>{userInfo?.userEmail || ''}</Text>
            </SmoothCurvedView>

            <Text style={styles.label}>생일</Text>
            <SmoothCurvedView style={[styles.input, { alignSelf: 'center' }]} customWidth={width * 0.95} fill="#f9f9f9">
              <Text style={styles.text}>{userInfo?.userBirthdate || ''}</Text>
            </SmoothCurvedView>

            <Text style={styles.label}>챗봇 이름</Text>
            <SmoothCurvedView style={[styles.input, { alignSelf: 'center' }]} customWidth={width * 0.95} fill="#f9f9f9">
              <Text style={styles.text}>{userInfo?.chatbotName || ''}</Text>
            </SmoothCurvedView>

              <Text style={styles.label}>비밀번호 확인</Text>
              <SmoothCurvedInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="기존 비밀번호 입력"
                placeholderTextColor="#707070"
                fillColor="#f9f9f9"
                customWidth={width*0.95}
              />

              <Text style={styles.label}>비밀번호 변경</Text>
              <SmoothCurvedInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                placeholder="새 비밀번호 입력"
                placeholderTextColor="#707070"
                fillColor="#f9f9f9"
                customWidth={width*0.95}
              />
        <View style={[styles.toggleContainer,{marginTop:15}]}>
          <Text style={[styles.label]}>알림 받기</Text>
          <Switch onValueChange={toggleSwitch} value={notificationsEnabled} trackColor={{ false: '#767577', true: '#c6fdbf' }} thumbColor={notificationsEnabled ? '#4a9960' : '#f4f3f4'} />
        </View>
        {notificationsEnabled && (
          <View style={styles.timeInputContainer}>
            <View style={styles.timeInput}>
              <Text style={styles.timeLabel}>시작 시간</Text>
              <TextInput style={styles.timeInputField} value={startTime} onChangeText={setStartTime} placeholder="00:00" keyboardType="numeric" maxLength={5} />
            </View>
            <View style={styles.timeInput}>
              <Text style={styles.timeLabel}>종료 시간</Text>
              <TextInput style={styles.timeInputField} value={endTime} onChangeText={setEndTime} placeholder="00:00" keyboardType="numeric" maxLength={5} />
            </View>
          </View>
        )}
      </ScrollView>
      <View style={styles.buttonContainer}>
                    <View style={styles.buttonCon}>
                      <SmoothCurvedButton
                          title="설정 저장"
                          onPress={handleSave}
                          style={[styles.buttonSpacing, styles.defaultButton]}  // 추가 스타일 적용
                      />

                    </View>

                  </View>
                  <Modal visible={modalVisible} transparent={true} animationType="fade">
                    <View style={styles.modalContainer}>
                      <View style={[styles.modalContent,{gap:19}]}>
                        <Text style={styles.modalTitle}>프로필 이미지 변경</Text>
                        <SmoothCurvedButton
                          title="기본 이미지로 재설정"
                          onPress={handleResetProfileImage}
                          customWidth={265} // 원하는 너비 전달
                        />
                        <SmoothCurvedButton
                          title="갤러리에서 이미지 선택"
                          onPress={handleImageSelect}
                          customWidth={265} // 원하는 너비 전달
                        />
                        <SmoothCurvedButton
                          title="취소"
                          onPress={() => setModalVisible(false)}
                          customWidth={265} // 원하는 너비 전달
                          color="#cccccc"
                        />
                      </View>
                    </View>
                  </Modal>



                </KeyboardAvoidingView>
              );
            };

            const styles = StyleSheet.create({
              buttonCon: {
              flexDirection: 'row',
              justifyContent: 'center', // 버튼을 가운데 정렬
              padding: 10,
               },
            buttonSpacing: {
              marginHorizontal: -20, // 두 버튼 간의 간격 조정
            },
              container: {
                flex: 1,
                backgroundColor: '#fff'
              },
              contentContainer: {
                flexGrow: 1,
                padding: 20
              },
              loadingContainer: {
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center'
              },
              profileImageSection: {
                alignItems: 'center',
                marginVertical: 20
              },
              profileImageContainer: {
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: '#f5f5f5',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative'
              },
              profileImage: {
                width: '100%',
                height: '100%',
                borderRadius: 50
              },
              defaultProfileImage: {
                width: '100%',
                height: '100%',
                borderRadius: 50,
                backgroundColor: '#f5f5f5',
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#eee'
              },
              cameraIconContainer: {
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: '#4a9960',
                width: 32,
                height: 32,
                borderRadius: 16,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: '#fff'
              },
              label: {
                fontSize: 18,
                fontWeight: 'bold',
                marginBottom: 5,
                marginTop:10
              },
              input: {
              },
              toggleContainer: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 15
              },
              timeInputContainer: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 20
              },
              timeInput: {
                width: '45%'
              },
              timeLabel: {
                fontSize: 16,
                fontWeight: '500',
                marginBottom: 8,
                color: '#555'
              },
              timeInputField: {
                height: 40,
                borderColor: '#ccc',
                borderWidth: 0.35,
                borderRadius: 16,
                paddingHorizontal: 12,
                fontSize: 16,
                textAlign: 'center',
              },
              buttonContainer: {
                flexDirection: 'row',
                justifyContent: 'center',
                padding: 10,
              },
              buttonText:{
                fontSize: 15,
                                textDecorationLine: 'underline', // 밑줄 추가
                },
              actionButtonText: {
                color: '#fff',
                fontWeight: 'bold',
                fontSize: 20,
                textDecorationLine: 'underline', // 밑줄 추가
              },
              modalContainer: {
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.5)'
              },
              modalContent: {
                width: 300,
                padding: 20,
                backgroundColor: 'white',
                borderRadius: 20,
                alignItems: 'center'
              },
              modalButton: {
                justifyContent: 'center',
                alignItems: 'center',
                marginVertical: 5,      // 버튼 간 간격을 줄입니다
                paddingVertical: 4,     // 버튼의 세로 여백을 키웁니다
              },
              modalTitle: {
                fontSize: 18,
                fontWeight: 'bold',
              },
            });

            export default SettingsScreen;
