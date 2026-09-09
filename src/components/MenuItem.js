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
      <View style={styles.actionBox}>
        {quantity === 0 ? (
          <Pressable style={styles.addButton} onPress={() => addItem(item)}>
            <Text style={styles.actionText}>ADD</Text>
          </Pressable>
        ) : (
          <View style={styles.counterContainer}>
            <Pressable style={styles.counterButton} onPress={() => decreaseItem(item.id)}>
              <Text style={styles.actionText}>−</Text>
            </Pressable>

            <Text style={styles.quantity}>{quantity}</Text>

            <Pressable style={styles.counterButton} onPress={() => increaseItem(item.id)}>
              <Text style={styles.actionText}>+</Text>
            </Pressable>
          </View>
        )}
      </View>
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

  actionBox: {
    width: 104,
    height: 40,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#16A34A',
    borderRadius: 10,
    overflow: 'hidden',
  },

  addButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  actionText: {
    color: '#16A34A',
    fontWeight: '700',
    fontSize: 16,
  },

  counterContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  counterButton: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  quantity: {
    flex: 1,
    fontWeight: '700',
    color: '#16A34A',
    fontSize: 16,
    textAlign: 'center',
  },
});
