import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { RestaurantScreen } from '../screens/RestaurantScreen';
// import {TestScreen} from '../screens/TestScreen'
// create the stack manager
// - Stack.Navigator => holds all screen
// - Stack.Screen => Registers one screen

const Stack = createNativeStackNavigator();

export function AppNavigator() {
//   console.log('Stack:', Stack);
//   console.log("============STACK============")
//   console.log('Stack keys:', Object.keys(Stack));
  return (
    <NavigationContainer>
      <Stack.Navigator  
      // screenOptions={{ headerShown: false }}
      >
        {/* <Stack.Screen
                    name="Test"
                    component={TestScreen}
                /> */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Restaurant" component={RestaurantScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
