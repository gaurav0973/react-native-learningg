import { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, View } from 'react-native';
import { OFFERS } from '../data/offers';
import { OfferBanner } from './OfferBanner';

const SCREEN_WIDTH = Dimensions.get('window').width;
const BANNER_WIDTH = SCREEN_WIDTH - 40;
const ITEM_SPACING = 12;
const SNAP_INTERVAL = BANNER_WIDTH + ITEM_SPACING;

export function OfferCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const nextIndex = (prev + 1) % OFFERS.length;
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        return nextIndex;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const getItemLayout = (_, index) => ({
    length: SNAP_INTERVAL,
    offset: SNAP_INTERVAL * index,
    index,
  });

  const handleScrollToIndexFailed = info => {
    flatListRef.current?.scrollToOffset({
      offset: info.averageItemLength * info.index,
      animated: true,
    });
  };

  return (
    <View style={styles.wrapper}>
      <FlatList
        ref={flatListRef}
        data={OFFERS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        snapToInterval={SNAP_INTERVAL}
        snapToAlignment="start"
        decelerationRate="fast"
        getItemLayout={getItemLayout}
        onScrollToIndexFailed={handleScrollToIndexFailed}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item }) => (
          <View style={styles.bannerContainer}>
            <OfferBanner
              title={item.title}
              subtitle={item.subtitle}
              animation={item.animation}
              containerStyle={styles.banner}
            />
          </View>
        )}
      />

      <View style={styles.pagination}>
        {OFFERS.map((offer, index) => (
          <View
            key={offer.id}
            style={[styles.dot, currentIndex === index && styles.activeDot]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 20,
  },
  bannerContainer: {
    width: BANNER_WIDTH,
    marginRight: ITEM_SPACING,
  },
  banner: {
    marginVertical: 0,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 4,
  },
  activeDot: {
    width: 20,
    backgroundColor: '#16A34A',
  },
});
