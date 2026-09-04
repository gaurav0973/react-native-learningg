import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

export function BackgroundImage({
  source,
  style,
  imageStyle,
  resizeMode = 'cover',
  children,
}) {
  return (
    <View style={[styles.container, style]}>
      <Image
        source={source}
        style={[StyleSheet.absoluteFillObject, imageStyle]}
        resizeMode={resizeMode}
      />

      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  content: {
    ...StyleSheet.absoluteFillObject,
  },
});