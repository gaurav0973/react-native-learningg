import React, { useContext } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import { CartContext } from '../context/CartContext';

export function CartItem({ item }) {
  const { increaseItem, decreaseItem } = useContext(CartContext);
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.price}>₹{item.price}</Text>
      </View>

      <View style={styles.counterContainer}>
        <Pressable
          style={styles.counterButton}
          onPress={() => decreaseItem(item.id)}
        >
          <Text style={styles.counterText}>−</Text>
        </Pressable>
        <Text style={styles.quantity}>{item.quantity}</Text>
        <Pressable
          style={styles.counterButton}
          onPress={() => increaseItem(item.id)}
        >
          <Text style={styles.counterText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,

    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  leftSection: {
    flex: 1,
  },

  title: {
    fontSize: 18,
    fontWeight: '600',
  },

  price: {
    marginTop: 8,
    fontWeight: '700',
    color: '#16A34A',
  },

  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',

    borderWidth: 1,
    borderColor: '#16A34A',

    borderRadius: 10,
  },

  counterButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  counterText: {
    fontSize: 18,
    color: '#16A34A',
    fontWeight: '700',
  },

  quantity: {
    minWidth: 24,
    textAlign: 'center',
    color: '#16A34A',
    fontWeight: '700',
  },
});

