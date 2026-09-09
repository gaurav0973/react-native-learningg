import { NavigationContainer } from '@react-navigation/native';

import {BottomTabs} from "./BottomTabs"

export function AppNavigator() {
  return (
    <NavigationContainer>
      <BottomTabs />
    </NavigationContainer>
  );
}
