import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import SmoothCurvedButton from '../../components/SmoothCurvedButton';
import { serverAddress } from '../../components/Config';
import SmoothCurvedInput from '../../components/SmoothCurvedInput';  // 이전에 만든 SmoothCurvedInput 컴포넌트

export default function JoinScreen() {
  const router = useRouter();

  const [userEmail, setEmail] = useState('');
  const [userPw, setPassword] = useState('');
  const [userPwConfirm, setPasswordConfirm] = useState('');
  const [userNick, setNickname] = useState('');
  const [userBirthdate, setBirthdate] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [nicknameMessage, setNicknameMessage] = useState('');
  const [birthdateMessage, setBirthdateMessage] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState(null);

  // Input refs
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const passwordConfirmInputRef = useRef(null);
  const nicknameInputRef = useRef(null);
  const birthdateInputRef = useRef(null);

  const handleEmailChange = (email) => {
    setEmail(email);
    setEmailMessage('');
    setIsEmailValid(false);

    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const newTimeout = setTimeout(() => {
      checkEmailAvailability(email);
    }, 500);

    setDebounceTimeout(newTimeout);
  };

  const checkEmailAvailability = async (email) => {
    if (!email) return;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) {
      setEmailMessage('올바른 이메일 형식이 아닙니다.');
      setIsEmailValid(false);
      return;
    }

    try {
      const response = await fetch(`${serverAddress}/api/users/checkEmail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: email })
      });

      const result = await response.text();
      if (result.includes('중복된 이메일')) {
        setEmailMessage('중복된 이메일입니다.');
        setIsEmailValid(false);
      } else if (result.includes('사용 가능')) {
        setEmailMessage('사용 가능한 이메일입니다.');
        setIsEmailValid(true);
      } else {
        setEmailMessage('이메일 확인 중 오류가 발생했습니다.');
        setIsEmailValid(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setEmailMessage('이메일 확인 중 오류가 발생했습니다.');
      setIsEmailValid(false);
    }
  };


  const validatePassword = () => {
    if (userPw.length < 8) {
      setPasswordMessage('비밀번호는 최소 8자 이상이어야 합니다.');
      return false;
    }
    // 영어 소문자와 숫자를 포함하는지 검사
    if (!/[a-z]/.test(userPw) || !/[0-9]/.test(userPw)) {
      setPasswordMessage('비밀번호는 영어 소문자와 숫자를 포함해야 합니다.');
      return false;
    }
    setPasswordMessage('');
    return true;
  };


  const handlePasswordConfirmChange = (text) => {
    setPasswordConfirm(text);
    setPasswordMessage(
      text && text !== userPw ? '비밀번호가 다릅니다.' : '비밀번호가 일치합니다.'
    );
  };

  const validateNickname = () => {
    if (userNick.length < 2) {
      setNicknameMessage('닉네임은 최소 2자 이상이어야 합니다.');
      return false;
    }
  if (userNick.length > 10) {
    setNicknameMessage('닉네임은 최대 10자까지 가능합니다.');
    return false;
  }

  // 2. 한글과 영어만 허용 (특수문자와 숫자 제외)
  const nicknameRegex = /^[a-zA-Z가-힣]+$/;
  if (!nicknameRegex.test(userNick)) {
    setNicknameMessage('닉네임은 한글과 영어만 포함할 수 있습니다.');
    return false;
  }
    setNicknameMessage('');
    return true;
  };

const handleBirthdateChange = (text) => {
  // 숫자만 허용하고 최대 8자리까지만 입력 가능
  const filteredText = text.replace(/[^0-9]/g, '').slice(0, 8);  // 숫자만 남기고 8자리로 제한
  setBirthdate(filteredText);
};

const validateBirthdate = () => {
  // 8자리 숫자만 입력되어야 함
  const birthdateRegex = /^\d{8}$/;
  if (!birthdateRegex.test(userBirthdate)) {
    setBirthdateMessage('생년월일은 8자리 숫자여야 합니다.');
    return false;
  }

  // 날짜 유효성 검사 (2023년 02월 29일처럼 잘못된 날짜 체크)
  const year = parseInt(userBirthdate.slice(0, 4), 10);
  const month = parseInt(userBirthdate.slice(4, 6), 10);
  const day = parseInt(userBirthdate.slice(6, 8), 10);

  // 날짜 객체 생성하여 유효성 검사
  const date = new Date(year, month - 1, day);  // month - 1은 0부터 시작하기 때문
  if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
    setBirthdateMessage('유효한 날짜가 아닙니다.');
    return false;
  }

  // 날짜가 미래가 아니라는 검증
  const today = new Date();
  if (date > today) {
    setBirthdateMessage('생년월일은 오늘 이전이어야 합니다.');
    return false;
  }

  setBirthdateMessage('');
  return true;
};


  const handleJoin = async () => {
    // 유효성 검사 후, 비어있는 필드로 포커스를 이동시킴
    if (!userEmail) {
      emailInputRef.current?.focus();  // 이메일 필드로 포커스 이동
      setEmailMessage('이메일을 입력하세요.');
      return;
    }

    if (!isEmailValid) {
      emailInputRef.current?.focus();
      return;
    }

    if (!validatePassword()) {
      passwordInputRef.current?.focus();  // 비밀번호 필드로 포커스 이동
      return;
    }

    if (userPw !== userPwConfirm) {
      passwordConfirmInputRef.current?.focus();  // 비밀번호 확인 필드로 포커스 이동
      setPasswordMessage('비밀번호가 다릅니다.');
      return;
    }

    if (!validateNickname()) {
      nicknameInputRef.current?.focus();  // 닉네임 필드로 포커스 이동
      return;
    }

    if (!validateBirthdate()) {
      birthdateInputRef.current?.focus();  // 생년월일 필드로 포커스 이동
      return;
    }


    // 가입 진행
    let birthdateString;
    if (userBirthdate.length === 8) {
      const year = userBirthdate.slice(0, 4);
      const month = userBirthdate.slice(4, 6);
      const day = userBirthdate.slice(6, 8);
      birthdateString = `${year}-${month}-${day}T00:00:00`;
    } else {
      birthdateString = null;
    }

    const userData = {
      userEmail,
      userPw,
      userNick,
      userBirthdate: birthdateString
    };
    console.log("1차 보낼 데이터", JSON.stringify(userData));
    try {
      router.push({
        pathname: '/index2',
        params: {
          userData: JSON.stringify(userData)
        },
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.select({ ios: 40, android: 0 })}
      >
        <ScrollView
          contentContainerStyle={styles.scrollView}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              {/* 이메일 입력 */}
              <View style={styles.labelWithMessage}>
                <Text style={styles.label}>이메일</Text>
                {emailMessage && (
                  <Text style={[styles.message, emailMessage.includes('올바른 이메일 형식이 아닙니다.') ? styles.errorMessage : styles.successMessage]}>
                    {emailMessage}
                  </Text>

                )}
              </View>
              <SmoothCurvedInput
                ref={emailInputRef}
                value={userEmail}
                onChangeText={handleEmailChange}
                placeholder="이메일 주소를 입력하세요"
                style={styles.input}
                keyboardType="email-address"
              />

              {/* 비밀번호 입력 */}
              <View style={styles.labelWithMessage}>
                <Text style={styles.label}>비밀번호</Text>
                {passwordMessage && (
                  <Text style={[styles.message, passwordMessage.includes('일치') ? styles.successMessage : styles.errorMessage]}>
                    {passwordMessage}
                  </Text>
                )}
              </View>
              <SmoothCurvedInput
                ref={passwordInputRef}
                value={userPw}
                onChangeText={setPassword}
                placeholder="비밀번호를 입력하세요"
                secureTextEntry
                style={styles.input}
              />

              {/* 비밀번호 확인 입력 */}
              <View style={styles.labelWithMessage}>
                <Text style={styles.label}>비밀번호 확인</Text>
                {passwordMessage && (
                  <Text style={[styles.message, passwordMessage.includes('일치') ? styles.successMessage : styles.errorMessage]}>
                    {passwordMessage}
                  </Text>
                )}
              </View>
              <SmoothCurvedInput
                ref={passwordConfirmInputRef}
                value={userPwConfirm}
                onChangeText={handlePasswordConfirmChange}
                placeholder="비밀번호를 다시 입력하세요"
                secureTextEntry
                style={styles.input}
              />

              {/* 닉네임 입력 */}
              <View style={styles.labelWithMessage}>
                <Text style={styles.label}>닉네임</Text>
                {nicknameMessage && (
                  <Text style={[styles.message, nicknameMessage ? styles.errorMessage : styles.successMessage]}>
                    {nicknameMessage}
                  </Text>
                )}
              </View>
              <SmoothCurvedInput
                ref={nicknameInputRef}
                value={userNick}
                onChangeText={setNickname}
                placeholder="닉네임을 입력하세요"
                style={styles.input}
              />

              {/* 생년월일 입력 */}
              <View style={styles.labelWithMessage}>
                <Text style={styles.label}>생년월일</Text>
                {birthdateMessage && (
                  <Text style={[styles.message, birthdateMessage ? styles.errorMessage : styles.successMessage]}>
                    {birthdateMessage}
                  </Text>
                )}
              </View>
              <SmoothCurvedInput
                ref={birthdateInputRef}
                value={userBirthdate}
                onChangeText={handleBirthdateChange}
                placeholder="YYYYMMDD"
                keyboardType="numeric"
                style={styles.input}
              />
            </View>

            <View style={styles.buttonContainer}>
              <SmoothCurvedButton title="가입" onPress={handleJoin} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  formContainer: {
    padding: 15,
  },
  inputContainer: {
    marginBottom: 20,
  },
  labelWithMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    padding: 15,
    marginBottom: 15,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  message: {
    fontSize: 12,
    marginLeft: 10,
  },
  errorMessage: {
    color: 'red',
  },
  successMessage: {
    color: 'green',
  },
});
