import React, { useContext } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { CartContext } from '../context/CartContext';

export function MenuItem({ item }) {
  // console.log(item)
  const { cartItems, setCartItems } = useContext(CartContext);
  //  cartItems => list hai => useState me yahi to likha tha!
  // console.log(cartItems)

  // exisiting items pata karo => pata bhi too ho ki cart me kya item hai abhi tk
  const existingItem = cartItems.find(cartItem => cartItem.id === item.id);
  // console.log(existingItem);
  const quantity = existingItem ? existingItem.quantity : 0;
  // console.log(quantity)
  const addToCart = () => {
    setCartItems([
      ...cartItems, // global cart provider me jo hai, vo rakh lo 
      {...item, quantity: 1} // add new item , jab vo add hoga then quantity = 1 ho jayegi na!
    ]);
  };

  function increaseQuantity() {
    const updatedCart = cartItems.map(cartItem => {
      
      // agar pahle se cart me hai, then quantity 1 se badha do 
      if (cartItem.id === item.id) {
        return {
          ...cartItem, 
          quantity: cartItem.quantity + 1,
        };
      }
      // otehrwise simply jaisa hai, vaisa hi rahne do bhai
      return cartItem;
    });
    setCartItems(updatedCart);
  }


  function decreaseQuantity() {

    // quantity = 1 => remove the item from the cart
    if (quantity === 1) {
      const filteredCart = cartItems.filter(
        cartItem => cartItem.id !== item.id,
      );
      setCartItems(filteredCart);

      return;
    }

    // Quantity > 1 => ek se kam karne ka hai, same as pervious 
    const updatedCart = cartItems.map(cartItem => {
      if (cartItem.id === item.id) {
        return {
          ...cartItem,
          quantity: cartItem.quantity - 1,
        };
      }
      return cartItem;
    });
    setCartItems(updatedCart);
  }
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <Text style={styles.title}>{item.name}</Text>

        <Text style={styles.description}>{item.description}</Text>

        <Text style={styles.price}>{item.price}</Text>
      </View>
      {quantity === 0 ? (
        <Pressable style={styles.addButton} onPress={addToCart}>
          <Text style={styles.addText}>ADD</Text>
        </Pressable>
      ) : (
        <View style={styles.counterContainer}>
          <Pressable style={styles.counterButton} onPress={decreaseQuantity}>
            <Text style={styles.counterText}>−</Text>
          </Pressable>

          <Text style={styles.quantity}>{quantity}</Text>

          <Pressable style={styles.counterButton} onPress={increaseQuantity}>
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
