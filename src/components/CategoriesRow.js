import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { categories } from '../data/categories';
import { CategoryChip } from './CategoryChip';

export function CategoriesRow() {
  return (
    <ScrollView
      horizontal
      style={styles.scrollView}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((category, index) => (
        <CategoryChip key={index} title={category} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 0,
    flexShrink: 0,
  },
  container: {
    paddingVertical: 20,
    paddingRight: 20,
  },
});
