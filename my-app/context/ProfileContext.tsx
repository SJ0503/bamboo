import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { serverAddress } from '../components/Config';

const ASYNC_STORAGE_KEYS = {
    USER_INFO: 'userInfo',
    PROFILE_IMAGE_URI: 'profileImageUri',
    CHATBOT_LEVEL: 'chatbotLevel',
};

export interface User {
    userEmail: string;
    userPw: string;
    userNick: string;
    userBirthdate: string;
    quietStartTime: string;
    quietEndTime: string;
    chatbotType: string;
    joinedAt: string;
    chatbotName: string;
    chatbotLevel: number;
    profileImage: string;
    toggle: boolean;
}

interface ProfileContextData {
    profileImageUri: string | null;
    setProfileImageUri: (uri: string | null) => void;
    chatbotLevel: number;
    setChatbotLevel: (level: number) => void;
}

const ProfileContext = createContext<ProfileContextData | undefined>(undefined);

export const ProfileProvider: React.FC = ({ children }) => {
    const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
    const [chatbotLevel, setChatbotLevelState] = useState<number>(1);
    const [userData, setUserData] = useState<User | null>(null);

    // 프로필 이미지와 챗봇 레벨 로드
    useEffect(() => {
        const loadProfileData = async () => {
            console.log("[ProfileContext] Starting to load profile data...");
            try {
                const userInfoString = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.USER_INFO);
                if (userInfoString) {
                    const userInfo: User = JSON.parse(userInfoString);
                    setUserData(userInfo);

                    // 챗봇 레벨 로드
                    const savedLevel = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.CHATBOT_LEVEL);
                    if (savedLevel) {
                        setChatbotLevelState(Number(savedLevel));
                    } else {
                        setChatbotLevelState(userInfo.chatbotLevel);
                    }

                    // 프로필 이미지 로드
                    const savedProfileImage = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.PROFILE_IMAGE_URI);
                    if (savedProfileImage) {
                        setProfileImageUri(savedProfileImage);
                        console.log("[ProfileContext] Loaded profile image URI from AsyncStorage:", savedProfileImage);
                    } else if (userInfo.profileImage) {
                        setProfileImageUri(userInfo.profileImage);
                        console.log("[ProfileContext] Loaded profile image from userInfo:", userInfo.profileImage);
                    }
                }
            } catch (error) {
                console.error("[ProfileContext] Error loading profile data:", error);
            }
        };

        loadProfileData();
    }, []);

    // 프로필 이미지 업데이트
    const updateProfileImageUri = async (uri: string | null) => {
        console.log("[ProfileContext] Updating profileImageUri to:", uri);
        try {
            if (uri) {
                await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.PROFILE_IMAGE_URI, uri);
            } else {
                await AsyncStorage.removeItem(ASYNC_STORAGE_KEYS.PROFILE_IMAGE_URI);
            }
            setProfileImageUri(uri);
        } catch (error) {
            console.error("[ProfileContext] Error updating profile image URI:", error);
        }
    };

    // 챗봇 레벨 업데이트
    const setChatbotLevel = async (level: number) => {
        console.log("[ProfileContext] Setting chatbotLevel to:", level);
        try {
            // AsyncStorage에 챗봇 레벨 저장
            await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.CHATBOT_LEVEL, level.toString());

            // userData 업데이트
            if (userData) {
                const updatedUserData = { ...userData, chatbotLevel: level };
                setUserData(updatedUserData);
                await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.USER_INFO, JSON.stringify(updatedUserData));
                console.log("[ProfileContext] Updated userData:", updatedUserData);
            }

            // 상태 업데이트
            setChatbotLevelState(level);
        } catch (error) {
            console.error("[ProfileContext] Error setting chatbotLevel:", error);
        }
    };

    return (
        <ProfileContext.Provider
            value={{
                profileImageUri,
                setProfileImageUri: updateProfileImageUri,
                chatbotLevel,
                setChatbotLevel,
            }}
        >
            {children}
        </ProfileContext.Provider>
    );
};

export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error("useProfile must be used within a ProfileProvider");
    }
    return context;
};
