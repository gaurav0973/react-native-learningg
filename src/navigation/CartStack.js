import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CartScreen } from '../screens/CartScreen';
const Stack = createNativeStackNavigator();

export function CartStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CartScreen" component={CartScreen} options={{ headerTitle: 'Cart' }} />
    </Stack.Navigator>
  );
}
