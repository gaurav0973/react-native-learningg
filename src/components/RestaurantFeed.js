import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { restaurantData } from '../data/restaurantData';
import { RestaurantCard } from './RestaurantCard';

export function RestaurantFeed() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Top Restaurants Near You</Text>

      <FlatList
        data={restaurantData}
        renderItem={({ item }) => <RestaurantCard restaurant={item} />}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    flexShrink: 0,
  },
  list: {
    flex: 1,
  },
});
