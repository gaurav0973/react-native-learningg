import React from 'react';
import { StatusBar } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { CartProvider } from './src/context/CartContext';

function App() {
  return (
    <CartProvider>
      <StatusBar barStyle="auto" backgroundColor="#FFFFFF" />
      <AppNavigator />
    </CartProvider>
  );
}


export default App;
