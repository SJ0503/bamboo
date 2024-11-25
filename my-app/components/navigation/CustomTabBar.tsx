import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import { getUserInfo } from '../../storage/storageHelper';
import { TabBarIcon } from './TabBarIcon'; // 같은 폴더 내에서 가져오기

export default function CustomTabBar({ state, descriptors, navigation }) {
    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const transition = useSharedValue(0);
    const [userInfo, setUserInfo] = useState(null);

    const aspectRatio = width / height;
    const iconSize = Math.max(30, Math.min(40, width * 0.08 * aspectRatio));
    const tabBarHeight = iconSize * 2.5;

    useEffect(() => {
        const fetchUserInfo = async () => {
            const data = await getUserInfo();
            setUserInfo(data);
        };

        fetchUserInfo();

        const unsubscribe = navigation.addListener('state', fetchUserInfo);
        return unsubscribe;
    }, [navigation]);

    useEffect(() => {
        transition.value = withTiming(state.index, { duration: 300 });
    }, [state.index]);

    return (
        <View style={[styles.tabContainer, { paddingBottom: insets.bottom, width, height: tabBarHeight }]}>
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                    });

                    if (!event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };

                const iconName = route.name === 'index' ? (isFocused ? 'chatbubbles' : 'chatbubbles-outline') :
                    route.name === '(diary)' ? (isFocused ? 'calendar' : 'calendar-outline') :
                        route.name === 'myPage' ? (isFocused ? 'person' : 'person-outline') :
                            route.name === 'report' ? (isFocused ? 'analytics' : 'analytics-outline') :
                                route.name === 'setting' ? (isFocused ? 'settings' : 'settings-outline') : '';

                const animatedStyle = useAnimatedStyle(() => ({
                    transform: [
                        {
                            scale: withTiming(isFocused ? 1.2 : 1, { duration: 200 }),
                        },
                    ],
                }));

                return (
                    <TouchableOpacity
                        key={route.key}
                        accessibilityRole="button"
                        onPress={onPress}
                        style={styles.tabItem}
                    >
                        <Animated.View style={animatedStyle}>
                            <TabBarIcon name={iconName} color={isFocused ? '#4a9960' : '#999'} size={iconSize} />
                        </Animated.View>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderColor: '#e0e0e0',
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
    },
});
