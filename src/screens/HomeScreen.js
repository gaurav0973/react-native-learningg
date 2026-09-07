import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

import { RestaurantCard } from '../components/RestaurantCard';
import { Header } from '../components/Header';
import { SearchBar } from '../components/SearchBar';
import { CategoriesRow } from '../components/CategoriesRow';
import { BannerCarousel } from '../components/BannerCarousel';
import { restaurantData } from '../data/restaurantData';
import { SafeAreaView } from 'react-native-safe-area-context';

export function HomeScreen({navigation, routes}) {
  // console.log("============NAVIGATION============")
  // console.log('navigation:', Object.keys(navigation));

  const renderRestaurant = ({ item }) => {
    return <RestaurantCard 
    restaurant={item}
    navigation={navigation}
    />;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
    <FlatList
      data={restaurantData}
      renderItem={renderRestaurant}
      keyExtractor={item => item.id}
      ListHeaderComponent={
        <View style={styles.headerContainer}>
          <Header />

          <SearchBar />

          <CategoriesRow />

          <BannerCarousel />

          <Text style={styles.sectionTitle}>Top Restaurants Near You</Text>
        </View>
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    paddingTop: 20,
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 20,
  },

  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
});