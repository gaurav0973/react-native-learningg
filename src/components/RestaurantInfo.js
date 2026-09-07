import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function RestaurantInfo({ restaurant }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{restaurant.name}</Text>

      <Text style={styles.cuisine}>{restaurant.cuisine}</Text>

      <View style={styles.metaRow}>
        <Text style={styles.meta}>⭐ {restaurant.rating}</Text>

        <Text style={styles.meta}>•</Text>

        <Text style={styles.meta}>{restaurant.deliveryTime}</Text>

        <Text style={styles.meta}>•</Text>

        <Text style={styles.meta}>{restaurant.price}</Text>
      </View>

      <View style={styles.offerCard}>
        <Text style={styles.offerTitle}>🎉 OFFER AVAILABLE</Text>

        <Text style={styles.offerText}>{restaurant.offer}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
  },

  cuisine: {
    marginTop: 10,
    color: '#666666',
    fontSize: 16,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },

  meta: {
    fontSize: 15,
    marginRight: 10,
  },

  offerCard: {
    backgroundColor: '#FFF2E8',
    padding: 16,
    borderRadius: 14,
    marginTop: 20,
  },

  offerTitle: {
    color: '#FF6B35',
    fontWeight: '700',
  },

  offerText: {
    marginTop: 8,
    fontWeight: '600',
  },
});
