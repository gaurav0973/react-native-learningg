import { createContext, useState } from 'react';

// This creates an empty shared container => provider will fill this
export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  const addItem = item => {
    setCartItems(previousCart => [
      ...previousCart,
      {
        ...item,
        quantity: 1,
      },
    ]);
  };

  const increaseItem = id => {
    setCartItems(previousCart =>
      previousCart.map(item => {
        if (item.id === id) {
          return {
            ...item,
            quantity: item.quantity + 1,
          };
        }

        return item;
      }),
    );
  };

  const decreaseItem = id => {
    setCartItems(previousCart => {
      const selectedItem = previousCart.find(item => item.id === id);
      if (selectedItem.quantity === 1) {
        return previousCart.filter(item => item.id !== id);
      }

      return previousCart.map(item => {
        if (item.id === id) {
          return {
            ...item,
            quantity: item.quantity - 1,
          };
        }

        return item;
      });
    });
  };



  return (
    <CartContext.Provider
      value={{
        cartItems,
        addItem,
        increaseItem,
        decreaseItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
