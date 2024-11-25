import React, { useState } from 'react';
import Svg, { Path } from 'react-native-svg';
import { TouchableOpacity, Text, StyleSheet, useWindowDimensions, View, Animated } from 'react-native';

const SmoothCurvedButton = ({ onPress, title, icon, disabled, color = '#4a9960', customWidth, customHeight, style, fadeAnim, textColor, }) => {
  const { width, height } = useWindowDimensions();
  const buttonWidth = customWidth || width * 0.95;
  const buttonHeight = customHeight || height * 0.06;
  const [isPressed, setIsPressed] = useState(false);
  const [scale] = useState(new Animated.Value(1)); // Animated scale state for button press effect
  const fontSize = Math.min(buttonWidth, buttonHeight) * 0.3;

  // fadeAnim이 존재하면 눌림 애니메이션을 비활성화하도록 처리
  const isFadeAnimPresent = fadeAnim !== undefined;

  // Press in handler
  const onPressIn = () => {
    !isFadeAnimPresent && Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
    setIsPressed(true);
  };

  // Press out handler
  const onPressOut = () => {
    !isFadeAnimPresent && Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
    setIsPressed(false);
  };

  return (
      <TouchableOpacity
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          style={[
            styles.buttonContainer,
            { width: buttonWidth, height: buttonHeight },
            style,
          ]}
          disabled={disabled}
          activeOpacity={0.7}
      >
        <Animated.View
            style={[
              { transform: [{ scale }] },
              { opacity: fadeAnim || 1 }, // fadeAnim이 전달되면 적용, 아니면 기본 1
              !isFadeAnimPresent && isPressed && styles.pressedEffect,
            ]}
        >
          <Svg height={buttonHeight} width={buttonWidth} viewBox={`0 0 ${buttonWidth} ${buttonHeight}`}>
            <Path
                d={`M0,20
                Q0,0 20,0
                L${buttonWidth - 20},0
                Q${buttonWidth},0 ${buttonWidth},20
                L${buttonWidth},${buttonHeight - 20}
                Q${buttonWidth},${buttonHeight} ${buttonWidth - 20},${buttonHeight}
                L20,${buttonHeight}
                Q0,${buttonHeight} 0,${buttonHeight - 20}
                Z`}
                fill={disabled ? '#cccccc' : isPressed ? '#3a7c54' : color}
            />
          </Svg>
        </Animated.View>
        <View style={styles.contentWrapper}>
          {icon && <View style={[styles.iconWrapper, !!title && { marginRight: 8 }]}>{icon}</View>}
          {title && (
              <Text
                  style={[
                    styles.buttonText,
                    {
                      fontSize,
                      color: disabled ? '#000000' : textColor || '#FFFFFF', // 비활성화일 경우 검정색, 기본 흰색
                    },
                    isPressed && styles.buttonTextPressed,
                  ]}
              >
                {title}
              </Text>
          )}
        </View>
      </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    borderRadius: 20,
  },
  contentWrapper: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white', // 기본 텍스트 색상 흰색
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonTextPressed: {
    color: '#ffffff',
  },
  pressedEffect: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
  },
});

export default SmoothCurvedButton;
