import React, { useMemo } from 'react';
import { View, Image, Text, Pressable, StyleSheet, useWindowDimensions, Animated } from 'react-native';

interface EmotionIconProps {
  emotionIcon: { key: string; label: string; icon: any }[];
  toggleEmotion: (emotion: string) => void;
  selectedEmotions: string[];
  iconSize?: number;
  iconMargin?: number;
}

const EmotionIcon: React.FC<EmotionIconProps> = ({
                                                   emotionIcon,
                                                   toggleEmotion,
                                                   selectedEmotions,
                                                   iconSize = 40,
                                                   iconMargin = 5,
                                                 }) => {
  const { width: screenWidth } = useWindowDimensions();
  const itemWidth = screenWidth / 7;
  const adjustedIconSize = iconSize || itemWidth * 0.7;
  const adjustedIconMargin = iconMargin || itemWidth * 0.05;

  // 아이콘 별 애니메이션 값 생성
  const animatedValues = useMemo(() => emotionIcon.map(() => new Animated.Value(1)), [emotionIcon]);

  return (
      <View style={styles.iconContainer}>
        {emotionIcon.map((emotion, index) => {
          const scaleAnim = animatedValues[index];
          const isSelected = selectedEmotions.includes(emotion.label);

          const handlePress = () => {
            toggleEmotion(emotion.label);

            Animated.timing(scaleAnim, {
              toValue: isSelected ? 1 : 1.2,
              duration: isSelected ? 250 : 150,
              useNativeDriver: true,
            }).start();
          };

          return (
              <Pressable
                  key={emotion.key}
                  onPress={handlePress}
                  style={[
                    styles.iconLabelContainer,
                    {
                      width: itemWidth,
                      marginHorizontal: adjustedIconMargin,
                      opacity: isSelected ? 1 : 0.3,
                    },
                  ]}
              >
                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                  <Image
                      source={emotion.icon}
                      style={{ width: adjustedIconSize, height: adjustedIconSize }}
                      resizeMode="contain"
                  />
                </Animated.View>
                <Text style={[styles.iconLabel, { color: isSelected ? '#333' : '#666' }]}>
                  {emotion.label}
                </Text>
              </Pressable>
          );
        })}
      </View>
  );
};

export default EmotionIcon;

const styles = StyleSheet.create({
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconLabelContainer: {
    alignItems: 'center',
  },
  iconLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});
