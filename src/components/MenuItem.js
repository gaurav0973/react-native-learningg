import React, { useContext } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { CartContext } from '../context/CartContext';

export function MenuItem({ item }) {
  // console.log(item)
  const { cartItems, addItem, increaseItem, decreaseItem, } = useContext(CartContext);
  const existingItem = cartItems.find(cartItem => cartItem.id === item.id);
  const quantity = existingItem ? existingItem.quantity : 0;
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <Text style={styles.title}>{item.name}</Text>

        <Text style={styles.description}>{item.description}</Text>

        <Text style={styles.price}>{item.price}</Text>
      </View>
      {quantity === 0 ? (
        <Pressable style={styles.addButton} onPress={() => addItem(item)}>
          <Text style={styles.addText}>ADD</Text>
        </Pressable>
      ) : (
        <View style={styles.counterContainer}>
          <Pressable style={styles.counterButton} onPress={() => decreaseItem(item.id)}>
            <Text style={styles.counterText}>−</Text>
          </Pressable>

          <Text style={styles.quantity}>{quantity}</Text>

          <Pressable style={styles.counterButton} onPress={() => increaseItem(item.id)}>
            <Text style={styles.counterText}>+</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',

    paddingVertical: 20,

    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },

  leftSection: {
    flex: 1,
    paddingRight: 20,
  },

  title: {
    fontSize: 18,
    fontWeight: '600',
  },

  description: {
    color: '#666666',
    marginTop: 8,
    lineHeight: 20,
  },

  price: {
    marginTop: 12,
    fontWeight: '700',
    fontSize: 16,
  },

  addButton: {
    alignSelf: 'center',

    borderWidth: 1,
    borderColor: '#16A34A',

    borderRadius: 10,

    paddingHorizontal: 20,
    paddingVertical: 10,
  },

  addText: {
    color: '#16A34A',
    fontWeight: '700',
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
    color: '#16A34A',
    fontWeight: '700',
    fontSize: 18,
  },

  quantity: {
    fontWeight: '700',
    color: '#16A34A',
    fontSize: 16,
    minWidth: 24,
    textAlign: 'center',
  },
});
