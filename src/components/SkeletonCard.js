import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

export function SkeletonCard() {
  /**
   * Create new animation variable
   * - why useRef ?
   *  - agar mai useState use karunga => animation would rerender every frame
   *  - useRed stores the animation object without causing renders
   *  - almost every animation example uses useRef
   */
  const shimmerValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // timing run ones => we want infinite shimmer
    Animated.loop(
      //  timing => animate from shimmerValue=0 to toValue=1 over time
      Animated.timing(shimmerValue, {
        toValue: 1, // target value
        duration: 1200, // 1.2 seconds
        useNativeDriver: true,
        /**
         * Why this is used ?
         *  - useNativeDriver : Most asked interview question
         *  - Without this
         *      - JS thread
         *      - Every animation Frame
         *      - UI updates
         *         - If JS becomes busy
         *         - Animation shutters
         *  - Native Driver
         *      - JS thread
         *      - Start ANimation
         *      - Native UI thread Handles Frames
         *      - smooth Animation
         *  - Whenever animatiing => opacity, transform => use native driver
         */
      }),
    ).start(); // nothing animates untill I start this
  }, []);

  /**
   * Interpolation means
   *    - convert one range into another
   *    - Animated Value : 0--------1
   *    - Output Pixels: -250--------------250
   *    - As value changes position changes
   *    - Why -250 to 250
   *        - shimmer starts outside the card
   *        - Move across => leaves teh card => create shimmer illusion
   */
  const translateX = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-250, 250],
  });
  const animatedStyle = {
    transform: [{ skewX: '-20deg' }, { translateX }],
  };

  return (
    <View style={styles.card}>
      <View style={styles.title} />
      <View style={styles.line} />
      <View style={styles.smallLine} />

      <Animated.View style={[styles.shimmer, animatedStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
    card:{
      backgroundColor:"#F3F4F6",
      borderRadius:18,
      padding:18,
      marginBottom:14,
      overflow:"hidden",
    },
  
    title:{
      height:22,
      width:"60%",
      borderRadius:6,
      backgroundColor:"#E5E7EB",
    },
  
    line:{
      marginTop:14,
      height:16,
      width:"80%",
      borderRadius:6,
      backgroundColor:"#E5E7EB",
    },
  
    smallLine:{
      marginTop:10,
      height:16,
      width:"45%",
      borderRadius:6,
      backgroundColor:"#E5E7EB",
    },
  
    shimmer:{
      position:"absolute",
      top:0,
      bottom:0,
      width:90,
      backgroundColor:"rgba(255,255,255,0.35)",
    },
  });