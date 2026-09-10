import { View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

export function OfferBanner({ title, subtitle, animation, containerStyle }) {
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <LottieView source={animation} autoPlay loop style={styles.animation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FEF3C7',
    borderRadius: 24,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 20,
  },

  textContainer: {
    flex: 1,
    marginRight: 12,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#92400E',
  },

  subtitle: {
    marginTop: 8,
    fontSize: 15,
    color: '#A16207',
  },

  animation: {
    width: 120,
    height: 120,
  },
});
