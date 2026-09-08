import { useContext } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { CartContext } from '../context/CartContext';

export function FloatingCartBar({ navigation }) {
  const { cartItems } = useContext(CartContext);

  //   calculate total item
  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  // calculate total price
  const totalPrice = cartItems.reduce(
    (total, item) => total + item.quantity * item.price,
    0,
  );

  //   jab kuch hai hi nahi => then UI me kuch show hi nahi karne ka hai
  if (cartItems.length === 0) {
    return null;
  }

  return (
    <Pressable
      style={styles.container}
      onPress={() => navigation.navigate('Cart')}
    >
      <View>
        <Text style={styles.itemCount}>{totalItems} Items</Text>
        <Text style={styles.price}>₹{totalPrice}</Text>
      </View>
      <Text style={styles.viewCart}>View Cart →</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 20,

    backgroundColor: '#16A34A',

    borderRadius: 16,

    paddingHorizontal: 20,
    paddingVertical: 16,

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  itemCount: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },

  price: {
    color: '#FFFFFF',
    marginTop: 4,
    fontSize: 15,
  },

  viewCart: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
