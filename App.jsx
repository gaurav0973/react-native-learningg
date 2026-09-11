import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AddressProvider } from './src/context/AddressContext';
import { CartProvider } from './src/context/CartContext';
import {createNotificationChannels, requestNotificationPermission} from './src/services/notificationService';

function App() {


  useEffect(()=>{
    async function initializeNotifications() {
      const hasPermission = await requestNotificationPermission();
      if (!hasPermission) {
        return;
      }
      await createNotificationChannels();
    }
    initializeNotifications();
  }, [])

  
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
