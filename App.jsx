import React from 'react';
import { StatusBar } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AddressProvider } from './src/context/AddressContext';
import { CartProvider } from './src/context/CartContext';

function App() {
  return (
    <CartProvider>
      <AddressProvider>
        <StatusBar barStyle="auto" backgroundColor="#FFFFFF" />
        <AppNavigator />
      </AddressProvider>
    </CartProvider>
  );
}


export default App;
