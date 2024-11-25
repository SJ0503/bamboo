import React, { forwardRef, useState } from 'react';
import Svg, { Path } from 'react-native-svg';
import { View, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const SmoothCurvedView = forwardRef(({
  style,
  customWidth,
  disabled,
  children,
  fill = '#FFFFFF',
  height: customHeight,
}, ref) => {
  const inputHeight = customHeight || height * 0.06;
  const inputWidth = customWidth || width * 0.95;
  const [isPressed, setIsPressed] = useState(false);

  return (
    <View style={[styles.inputContainer, { height: inputHeight, width: inputWidth }, style]}>
      <Svg height={inputHeight} width={inputWidth} viewBox={`0 0 ${inputWidth} ${inputHeight}`}>
        <Path
          d={`M0,20
            Q0,0 20,0
            L${inputWidth - 20},0
            Q${inputWidth},0 ${inputWidth},20
            L${inputWidth},${inputHeight - 20}
            Q${inputWidth},${inputHeight} ${inputWidth - 20},${inputHeight}
            L20,${inputHeight}
            Q0,${inputHeight} 0,${inputHeight - 20}
            Z`}
          fill={disabled ? '#cccccc' : isPressed ? '#3a7c54' : fill}
        />
      </Svg>
      <View style={styles.childrenContainer}>
        {children}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  inputContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  childrenContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
});

export default SmoothCurvedView;
