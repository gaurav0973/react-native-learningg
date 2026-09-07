import React from 'react';
import { StatusBar } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';

function App() {
  return (
    <>
      {/*TODO:  why there is no safearea => read about this and the flow  */}
      <StatusBar barStyle="auto" backgroundColor="#FFFFFF" />
      <AppNavigator />
    </>
  );
}


export default App;
