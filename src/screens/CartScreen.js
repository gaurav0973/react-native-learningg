import React, { useContext } from 'react';

import { FlatList, View, Text, Pressable, StyleSheet } from 'react-native';

import { CartContext } from '../context/CartContext';
import { CartItem } from '../components/CartItem';
import { BillSummary } from '../components/BillSummary';
import { SafeAreaView } from 'react-native-safe-area-context';

export function CartScreen({ navigation }) {
  const { cartItems } = useContext(CartContext);
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const deliveryFee = subtotal > 499 ? 0 : 40;
  const gst = Math.round(subtotal * 0.05);
  const total = subtotal + deliveryFee + gst;

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>

          <Text style={styles.emptySubtitle}>
            Add something delicious first 🍕
          </Text>

          <Pressable
            style={styles.browseButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.browseText}>Browse Restaurants</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={cartItems}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <CartItem item={item} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Cart</Text>
            <Text style={styles.subtitle}>{cartItems.length} Items</Text>
          </View>
        }
        ListFooterComponent={
          <>
            <BillSummary
              subtotal={subtotal}
              deliveryFee={deliveryFee}
              gst={gst}
              total={total}
            />

            <Pressable style={styles.checkoutButton}>
              <Text style={styles.checkoutText}>Proceed to Checkout</Text>
            </Pressable>
          </>
        }
        contentContainerStyle={styles.content}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    marginBottom: 10,
  },

  title: {
    fontSize: 30,
    fontWeight: '700',
  },

  subtitle: {
    color: '#666666',
    marginTop: 6,
    marginBottom: 20,
  },

  checkoutButton: {
    backgroundColor: '#16A34A',

    paddingVertical: 18,

    borderRadius: 16,

    alignItems: 'center',

    marginTop: 30,
  },

  checkoutText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
  },

  emptySubtitle: {
    color: '#666666',
    marginTop: 12,
    textAlign: 'center',
  },

  browseButton: {
    marginTop: 28,
    backgroundColor: '#16A34A',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },

  browseText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
