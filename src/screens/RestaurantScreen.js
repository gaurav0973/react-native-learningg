import React from 'react';
import {View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function RestaurantScreen({ route }) {
  const { restaurant } = route.params;
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>{restaurant.name}</Text>
        <Text style={styles.subtitle}>{restaurant.cuisine}</Text>
        <Text style={styles.rating}>⭐ {restaurant.rating}</Text>
        <Text style={styles.delivery}>
          Delivery in {restaurant.deliveryTime}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  container: {
    flex: 1,
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
  },

  subtitle: {
    fontSize: 18,
    marginTop: 10,
    color: '#666666',
  },

  rating: {
    fontSize: 18,
    marginTop: 24,
  },

  delivery: {
    fontSize: 18,
    marginTop: 8,
  },
});

