import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

import { RestaurantCard } from '../components/RestaurantCard';
import { Header } from '../components/Header';
import { SearchBar } from '../components/SearchBar';
import { CategoriesRow } from '../components/CategoriesRow';
import { BannerCarousel } from '../components/BannerCarousel';
import { useDebounce } from '../hooks/useDebounce';
import { restaurantData } from '../data/restaurantData';
import { SafeAreaView } from 'react-native-safe-area-context';

export function HomeScreen({ navigation, routes }) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [error, setError] = useState(null);
  
 
  /**
   * Debiuncing 
   *  - searchhText => runs whenever typing changes 
   *  - setTimeout => start times => waits 300 ms
   *  - cleanup => cancels the previous timer
   * so last typing ke baad , API will be called 
   */
  const debouncedSearch = useDebounce(searchText, 300);

  useEffect(() => {
    const fetchRestaurants = () => {
      setLoading(true);
      setTimeout(() => {
        try {
          setRestaurants(restaurantData);

          setLoading(false);
        } catch (err) {
          setError('Something went wrong.');

          setLoading(false);
        }
      }, 2000);
    };

    fetchRestaurants();
  }, []);

  /**
   * Why use Memo here
   * - every render executes restautant.filter
   * - search changes, loading chanegs , error chanegs  categories chanegs, cart chanegs 
   * - this filert will run ebery time 
   * USERFFECT : retures a catched value 
   */
  const filteredRestaurants = useMemo(() => {
    const query = debouncedSearch.toLowerCase();
    return restaurants.filter((restaurant) => {
      return (restaurant.name
          .toLowerCase()
          .includes(query)
      );
    });
  }, [restaurants, debouncedSearch]);

  const renderRestaurant = ({ item }) => {
    return <RestaurantCard restaurant={item} navigation={navigation} />;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.loadingText}>Loading Restaurants...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorTitle}>Oops!</Text>

        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={filteredRestaurants}
        renderItem={renderRestaurant}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <Header />

            <SearchBar 
            searchText={searchText}
            setSearchText={setSearchText}
            />

            <CategoriesRow />

            <BannerCarousel />

            <Text style={styles.sectionTitle}>Top Restaurants Near You</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        ListEmptyComponent={
          <View style={styles.emptySearchContainer}>
            <Text style={styles.emptySearchTitle}>
              No restaurants found
            </Text>
        
            <Text style={styles.emptySearchSubtitle}>
              Try searching with another keyword.
            </Text>
          </View>
        }
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    fontSize: 18,
    fontWeight: '600',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
  },

  errorText: {
    color: '#E53935',
    marginTop: 12,
  },

  // inside that
  emptySearchContainer:{
    alignItems:"center",
    paddingVertical:60,
  },
  
  emptySearchTitle:{
    fontSize:22,
    fontWeight:"700",
  },
  
  emptySearchSubtitle:{
    marginTop:12,
    color:"#666666",
  },
});
