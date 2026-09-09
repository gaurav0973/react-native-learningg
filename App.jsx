import React from 'react';
import { StatusBar } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { CartProvider } from './src/context/CartContext';
import { TurboModuleRegistry } from 'react-native';
console.log('RNAsyncStorage:', TurboModuleRegistry.get('RNAsyncStorage'));
function App() {
  console.log("Hello World");
  return (
    <CartProvider>
      <StatusBar barStyle="auto" backgroundColor="#FFFFFF" />
      <AppNavigator />
    </CartProvider>
  );
}


export default App;
