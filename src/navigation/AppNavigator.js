import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {HomeScreen} from '../screens/HomeScreen'
import {RestaurantScreen} from '../screens/RestaurantScreen'
// create the stack manager
// - Stack.Navigator => holds all screen
// - Stack.Screen => Registers one screen
const Stack = createNativeStackNavigator()

export function AppNavigator(){
    return(
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                />
                <Stack.Screen
                    name="Restaurant"
                    component={RestaurantScreen}
                />
            </Stack.Navigator>
        </NavigationContainer>
    )
}