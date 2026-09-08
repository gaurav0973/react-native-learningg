import { createContext, useState } from 'react';

// This creates an empty shared container => provider will fill this
export const CartContext = createContext();

export function CartProvider({ children }) {
    // console.log(CartContext)
  const [cartItems, setCartItems] = useState([]);
  return (
    <CartContext.Provider
      value={{
        cartItems,
        setCartItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
