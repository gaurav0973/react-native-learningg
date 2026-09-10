import React, { useEffect, useState } from 'react';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { FruitCard } from '../components/FruitCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { getAllFruits } from '../services/fruitService';

const PAGE_SIZE = 10;

function FooterLoader({ loadingMore }) {
  if (!loadingMore) {
    return null;
  }
  return (
    <View style={styles.footer}>
      <ActivityIndicator size="large" color="#16A34A" />
      <Text style={styles.footerText}>Loading More Fruits...</Text>
    </View>
  );
}

export function FruitExplorerScreen() {
  const [allFruits, setAllFruits] = useState([]);
  const [visibleFruits, setVisibleFruits] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const loadFruits = async () => {
    try {
      setLoading(true);
      const fruits = await getAllFruits();
      setAllFruits(fruits);
      setVisibleFruits(fruits.slice(0, PAGE_SIZE));
      setPage(1);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreFruits = () => {
    if (loadingMore) {
      return;
    }

    const nextPage = page + 1;
    const start = page * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const nextItems = allFruits.slice(start, end);
    if (nextItems.length === 0) {
      return;
    }
    setLoadingMore(true);

    //fake api call
    setTimeout(() => {
      setVisibleFruits(previous => [...previous, ...nextItems]);
      setPage(nextPage);
      setLoadingMore(false);
    }, 1000);
  };

  useEffect(() => {
    loadFruits();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.contentContainer}>
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </View>
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
    <SafeAreaView style={styles.container}>
      <FlashList
        data={visibleFruits}
        renderItem={({ item }) => <FruitCard fruit={item} />}
        keyExtractor={item => item.id.toString()}
        estimatedItemSize={120}
        onEndReached={loadMoreFruits}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={<Text style={styles.heading}>Fruit Explorer</Text>}
        ListFooterComponent={<FooterLoader loadingMore={loadingMore} />}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  heading: {
    fontSize: 28,
    fontWeight: '700',
    paddingTop: 20,
    paddingBottom: 16,
  },

  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '600',
  },

  footer: {
    paddingVertical: 24,
    alignItems: 'center',
  },

  footerText: {
    marginTop: 12,
    fontSize: 16,
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
});
