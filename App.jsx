import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from './src/components/Header';
import { SearchBar } from './src/components/SearchBar';
import { CategoriesRow } from './src/components/CategoriesRow';
import { BannerCarousel } from './src/components/BannerCarousel';
import { RestaurantFeed } from './src/components/RestaurantFeed';

function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="auto" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        <Header />
        <SearchBar />
        <CategoriesRow />
        <BannerCarousel />
        <RestaurantFeed />
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
});

export default App;
