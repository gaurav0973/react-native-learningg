import { NavigationContainer } from '@react-navigation/native';
import {linking} from "./linking"

import {BottomTabs} from "./BottomTabs"

export function AppNavigator() {
  return (
    <NavigationContainer linking={linking}>
      <BottomTabs />
    </NavigationContainer>
  );
}
