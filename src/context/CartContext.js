import { createContext, useEffect, useState } from 'react';
import { saveData, getData, STORAGE_KEYS } from '../services/storageService';

// This creates an empty shared container => provider will fill this
export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]); // state starts empty 

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

  /**
   * Restore cart on app launch
   *  - App starts => card provider mounts =>> this useEffect will run
   *  - Read async storage => restore the cart => update the UI
   */
  console.log("1️⃣ Render:", cartItems);
  // Effect A → Restore from storage
  useEffect(() => {
    console.log("2️⃣ Restore started");
    const restoreCart = async () => {
      const savedCart = await getData(STORAGE_KEYS.CART);
      console.log("3️⃣ Storage returned:", savedCart);
      if (savedCart) { 
        setCartItems(savedCart);
      }
    };
    restoreCart();
  }, []);

  /**
   * Saves cart automatically
   *  - whenever cartItems changes => run this function
   *  - Pizza added => cartItem changes => useEffect runs => AsyncStorgae Updated
   */
  // Effect B → Save whenever cart changes
  useEffect(() => {
    console.log("4️⃣ Save effect:", cartItems);
    saveData(STORAGE_KEYS.CART, cartItems);
  }, [cartItems]);

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
