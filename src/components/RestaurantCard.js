import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {BackgroundImage} from './BackgroundImage'

export function RestaurantCard({ restaurant }) {
  return (
    <View style={styles.card}>
      <BackgroundImage
        source={restaurant.image}
        style={styles.image}
        imageStyle={styles.imageRadius}
      >
        <View style={styles.ratingBadge}>
          <Text style={styles.badgeText}>⭐ {restaurant.rating}</Text>
        </View>

        <View style={styles.deliveryBadge}>
          <Text style={styles.badgeText}>{restaurant.deliveryTime}</Text>
        </View>
      </BackgroundImage>

      <View style={styles.content}>
        <Text style={styles.name}>{restaurant.name}</Text>
        <Text style={styles.cuisine}>{restaurant.cuisine}</Text>
        <Text style={styles.price}>{restaurant.price}</Text>
        <View style={styles.offerBadge}>
          <Text style={styles.offerText}>{restaurant.offer}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 28,
  },

  image: {
    height: 180,
    justifyContent: 'space-between',
    padding: 12,
  },

  imageRadius: {
    borderRadius: 18,
  },

  ratingBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#16A34A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },

  deliveryBadge: {
    alignSelf: 'flex-end',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },

  badgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },

  content: {
    marginTop: 12,
  },

  name: {
    fontSize: 20,
    fontWeight: '700',
  },

  cuisine: {
    color: '#666666',
    marginTop: 4,
  },

  price: {
    marginTop: 6,
    fontWeight: '600',
  },

  offerBadge: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: '#FFF2E8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },

  offerText: {
    color: '#FF6B35',
    fontWeight: '700',
    fontSize: 13,
  },
});
