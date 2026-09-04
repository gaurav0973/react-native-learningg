import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

export function BackgroundImage({
  source,
  style,
  imageStyle,
  contentStyle,
  resizeMode = 'cover',
  children,
}) {
  return (
    <View style={[styles.container, style]}>
      <Image
        source={source}
        style={[styles.image, imageStyle]}
        resizeMode={resizeMode}
      />
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  content: {
    ...StyleSheet.absoluteFillObject,
  },
});
