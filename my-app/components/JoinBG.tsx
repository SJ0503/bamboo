import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Dimensions, Animated } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Circle as SvgCircle } from 'react-native-svg';

type JoinBGProps = {
  children: React.ReactNode;
};

export default function JoinBG({ children }: JoinBGProps) {
  const [screenDimensions, setScreenDimensions] = useState(Dimensions.get('window'));

  // Animated values for each gradient's opacity
  const opacity1 = useRef(new Animated.Value(0.3)).current;
  const opacity2 = useRef(new Animated.Value(0.35)).current;
  const opacity3 = useRef(new Animated.Value(0.35)).current;
  const opacity4 = useRef(new Animated.Value(0.35)).current;

  const [opacityValue1, setOpacityValue1] = useState(0.3);
  const [opacityValue2, setOpacityValue2] = useState(0.35);
  const [opacityValue3, setOpacityValue3] = useState(0.35);
  const [opacityValue4, setOpacityValue4] = useState(0.35);

  useEffect(() => {
    const handleResize = () => setScreenDimensions(Dimensions.get('window'));
    const subscription = Dimensions.addEventListener('change', handleResize);
    return () => {
      subscription?.remove();
    };
  }, []);

  const { width, height } = screenDimensions;

  useEffect(() => {
    // Function to animate the opacity between 0 and the given max opacity
    const animateOpacity = (opacity: Animated.Value, setOpacity: (value: number) => void, maxOpacity: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0, // Fade out to 0
            duration: 3000,
            useNativeDriver: false,
          }),
          Animated.timing(opacity, {
            toValue: maxOpacity, // Fade in back to the max opacity
            duration: 3000,
            useNativeDriver: false,
          }),
        ])
      ).start();

      opacity.addListener(({ value }) => {
        setOpacity(value);
      });
    };

    // Start animations for each gradient with their respective initial opacities
    animateOpacity(opacity1, setOpacityValue1, 0.3);
    animateOpacity(opacity2, setOpacityValue2, 0.35);
    animateOpacity(opacity3, setOpacityValue3, 0.35);
    animateOpacity(opacity4, setOpacityValue4, 0.35);

    return () => {
      // Clean up listeners when component unmounts
      opacity1.removeAllListeners();
      opacity2.removeAllListeners();
      opacity3.removeAllListeners();
      opacity4.removeAllListeners();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Svg style={styles.svg}>
        <Defs>
          <RadialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <Stop offset="0%" stopColor="#6bff6e" stopOpacity={opacityValue1} />
            <Stop offset="100%" stopColor="#6bff6e" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="grad2" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <Stop offset="0%" stopColor="#6bdaff" stopOpacity={opacityValue2} />
            <Stop offset="100%" stopColor="#6bdaff" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="grad3" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <Stop offset="0%" stopColor="#ff6b6b" stopOpacity={opacityValue3} />
            <Stop offset="100%" stopColor="#ff6b6b" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="grad4" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <Stop offset="0%" stopColor="#eeff6b" stopOpacity={opacityValue4} />
            <Stop offset="100%" stopColor="#eeff6b" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        <SvgCircle cx={width * 0.5} cy={height * 0.25} r={width * 0.4} fill="url(#grad1)" />
        <SvgCircle cx={width * 0.85} cy={height * 0.4} r={width * 0.4} fill="url(#grad2)" />
        <SvgCircle cx={width * 0.5} cy={height * 0.55} r={width * 0.35} fill="url(#grad3)" />
        <SvgCircle cx={width * 0.2} cy={height * 0.4} r={width * 0.4} fill="url(#grad4)" />
      </Svg>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  svg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
});
