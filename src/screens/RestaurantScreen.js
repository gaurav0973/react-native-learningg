import React from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackgroundImage } from '../components/BackgroundImage';
import { RestaurantInfo } from '../components/RestaurantInfo';
import { menuData } from '../data/menuData';
import { MenuItem } from '../components/MenuItem';

const windowWidth = Dimensions.get('window').width;

export function RestaurantScreen({ navigation, route }) {
  const { restaurant } = route.params;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Banner */}
        <BackgroundImage source={restaurant.image} style={styles.banner}>
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.icon}>←</Text>
          </Pressable>

          <Pressable style={styles.favoriteButton}>
            <Text style={styles.icon}>♡</Text>
          </Pressable>
        </BackgroundImage>

        {/* Restaurant Info */}
        <RestaurantInfo restaurant={restaurant} />

        {/* Menu Section */}
        <View style={styles.menuSection}>
          <Text style={styles.menuTitle}>Recommended</Text>

          {menuData.map(item => (
            <MenuItem key={item.id} item={item} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  banner: {
    height: 200,
    width: windowWidth - 20,
    alignSelf: 'center',
    resizeMode: 'contain',
  },

  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,

    backgroundColor: '#FFFFFF',
    width: 42,
    height: 42,

    borderRadius: 21,

    justifyContent: 'center',
    alignItems: 'center',
  },

  favoriteButton: {
    position: 'absolute',
    top: 20,
    right: 20,

    backgroundColor: '#FFFFFF',

    width: 42,
    height: 42,

    borderRadius: 21,

    justifyContent: 'center',
    alignItems: 'center',
  },

  icon: {
    fontSize: 22,
  },

  menuSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  menuTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
  },
});
