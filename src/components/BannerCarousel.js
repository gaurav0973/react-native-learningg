import React from "react";
import {
  ScrollView,
  View,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";
import bannerData from "../data/bannerData";


const screenWidth = Dimensions.get("window").width;

export function BannerCarousel() {
  return (
    <ScrollView
      horizontal
      style={styles.scrollView}
      showsHorizontalScrollIndicator={false}
    >
      {bannerData.map((banner) => (
        <View key={banner.id} style={styles.bannerCard}>
          <Image
            source={banner.image}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 0,
    flexShrink: 0,
  },
  bannerCard: {
    width: screenWidth-40,
    height: 180,
    marginRight: 16,
    borderRadius: 18,
    overflow: "hidden",
  },

  bannerImage: {
    width: "100%",
    height: "100%",
  },
});
