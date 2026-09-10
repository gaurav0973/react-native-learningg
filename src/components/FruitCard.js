import React from 'react';

import { View, Text, StyleSheet } from 'react-native';

export function FruitCard({ fruit }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{fruit.name}</Text>
      <Text style={styles.family}>Family: {fruit.family}</Text>
      <Text style={styles.info}>Genus: {fruit.genus}</Text>
      <Text style={styles.info}>Calories: {fruit.nutritions.calories}</Text>
      <Text style={styles.info}>Sugar: {fruit.nutritions.sugar} g</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
  },

  family: {
    marginTop: 8,
    color: '#16A34A',
    fontWeight: '600',
  },

  info: {
    marginTop: 4,
    color: '#555555',
  },
});
