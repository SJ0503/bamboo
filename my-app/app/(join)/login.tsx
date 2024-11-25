import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { saveUserInfo } from '../../storage/storageHelper';
import axios from 'axios';
import SmoothCurvedButton from '../../components/SmoothCurvedButton';
import SmoothCurvedInput from '../../components/SmoothCurvedInput';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { serverAddress } from '@/components/Config';
export default function LoginScreen() {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isFindingPassword, setIsFindingPassword] = useState(false);


    const emailInputRef = useRef<TextInput>(null);
    const passwordInputRef = useRef<TextInput>(null);
    const dateOfBirthInputRef = useRef<TextInput>(null);

    // 로그인 핸들러 함수
    const handleLogin = async () => {
        if (!email) {
            setError('이메일을 입력하세요.');
            emailInputRef.current?.focus();
            return;
        }
        if (!password) {
            setError('비밀번호를 입력하세요.');
            passwordInputRef.current?.focus();
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.post(`${serverAddress}/api/users/login`, {
                userEmail: email,
                userPw: password,
            });
            const data =(response.data);
            console.log('서버 응답 데이터:', response.data);


            const { message, user, croomIdx } = response.data;
            if (message === '로그인 성공' && user) {
                await AsyncStorage.setItem('userEmail', email);
                await AsyncStorage.setItem('croomIdx', croomIdx?.toString() || '');
                const userEmail = await AsyncStorage.getItem('userEmail'); // 사용자 이메일 가져오기
                const token = await AsyncStorage.getItem("token"); // 저장된 푸시 토큰 가져오기
                await axios.post(`${serverAddress}/api/tokens/register`, {
                    token: token,
                    userEmail: userEmail,
                });
                console.log('Push token registered with server:', token);

                await saveUserInfo({
                    ...user,
                    profileImage: user.profileImage ? `${serverAddress}/uploads/profile/images/${user.profileImage}` : null,
                });
                router.replace('/(tabs)'); // router.push로 경로 이동
            } else {
                setError('로그인 실패: 서버 응답 확인 필요');
            }
        } catch (error) {
            console.error('Login failed:', error);
            setError(error?.response?.data?.message || '로그인에 실패했습니다. 다시 시도해주세요.');
            setPassword('');
        } finally {
            setIsLoading(false);
        }
    };

    // 생년월일을 YYYY-MM-DD 형식으로 변환하는 함수
    const formatBirthdate = (birthdate) => {
        if (birthdate.length === 8) {
            return `${birthdate.slice(0, 4)}-${birthdate.slice(4, 6)}-${birthdate.slice(6)}`;
        }
        return birthdate; // 변환할 수 없는 경우 그대로 반환
    };

    // 비밀번호 찾기 핸들러 함수
    const handleFindPassword = async () => {
        if (!email) {
            setError('이메일을 입력하세요.');
            emailInputRef.current?.focus();
            return;
        }
        if (!dateOfBirth) {
            setError('생년월일을 입력하세요.');
            dateOfBirthInputRef.current?.focus();
            return;
        }

        // 생년월일 형식을 YYYY-MM-DD로 변환
        const formattedDateOfBirth = formatBirthdate(dateOfBirth);

        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.post(`${serverAddress}/auth/find-password`, {
                email,
                dateOfBirth: formattedDateOfBirth, // 변환된 생년월일을 전송
            });

            if (response.data.success) {
                alert('임시 비밀번호가 이메일로 전송되었습니다.');
                setIsFindingPassword(false); // 로그인 폼으로 돌아가기
            } else {
                setError('일치하는 사용자 정보를 찾을 수 없습니다.');
            }
        } catch (error) {
            console.error('비밀번호 찾기 오류:', error);
            setError(error?.response?.data?.message || '비밀번호 찾기 중 오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.labelContainer}>
                <Text style={styles.label}>이메일</Text>
                {error && <Text style={styles.errorText}>{error}</Text>}
            </View>
            <SmoothCurvedInput
              ref={emailInputRef}
              value={email}
              onChangeText={setEmail}
              placeholder="이메일 주소를 입력하세요"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#707070"
              style={styles.input}
            />

            {isFindingPassword ? (
                <View style={styles.labelContainer}>
                    <Text style={styles.label}>생년월일</Text>
                </View>
            ) : (
                <View style={styles.labelContainer}>
                    <Text style={styles.label}>비밀번호</Text>
                </View>
            )}

            <SmoothCurvedInput
              ref={isFindingPassword ? dateOfBirthInputRef : passwordInputRef}
              value={isFindingPassword ? dateOfBirth : password}
              onChangeText={isFindingPassword ? setDateOfBirth : setPassword}
              placeholder={isFindingPassword ? "생년월일을 입력하세요 (YYYY-MM-DD)" : "비밀번호를 입력하세요"}
              secureTextEntry={!isFindingPassword}
              placeholderTextColor="#707070"
              style={styles.input}
            />


            <View style={[styles.buttonWrapper,{gap:10}]}>
                {isFindingPassword ? (
                    <SmoothCurvedButton
                        title={isLoading ? '비밀번호 찾는 중...' : '비밀번호 찾기'}
                        onPress={handleFindPassword}
                        disabled={isLoading}
                        style={[isLoading && styles.disabledButton]}
                    />
                ) : (
                    <SmoothCurvedButton
                        title={isLoading ? '로그인 중...' : '로그인'}
                        onPress={handleLogin}
                        disabled={isLoading}
                        style={[isLoading && styles.disabledButton]}
                    />
                )}

                <SmoothCurvedButton
                    title={isFindingPassword ? '로그인으로 돌아가기' : '비밀번호 찾기'}
                    onPress={() => setIsFindingPassword(!isFindingPassword)}
                    style={{ marginTop: 20 }}
                />

            </View>
        </View>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#ffffff',
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    label: {
        fontSize: 16,
    },
    input: {
        backgroundColor: '#e8f5e9',
        borderRadius: 16,
        padding: 10,
        marginBottom: 15,
    },
    buttonWrapper: {
      flex: 1,
      alignItems: 'center',
      marginTop:20,
    },
    disabledButton: {
        opacity: 0.6,
    },
    errorText: {
        color: '#ff0000',
        fontSize: 12,
        marginLeft: 10,
    },
    passButton: {
        backgroundColor: '#ffffff',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
        top: 50,
    },
    passButtonText: {
        color: '#3a7c54',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
