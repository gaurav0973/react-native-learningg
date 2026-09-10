import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeStack } from './HomeStack';
import { FruitExplorerScreen } from '../screens/FruitExplorerScreen';
import { CartStack } from './CartStack';
import { ProfileScreen } from '../screens/ProfileScreen';
import { CartIcon, FruitIcon, HomeIcon, ProfileIcon } from '../data/icons';

const Tab = createBottomTabNavigator();

export function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,

        // active and unactive color
        tabBarActiveTintColor: '#16A34A',
        tabBarInactiveTintColor: '#FF7F50',

        // toolbar style
        tabBarStyle: {
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
      }}
    >
      <Tab.Screen name="Home" component={HomeStack} 
      options={{
        tabBarLabel: "Home",
        tabBarIcon: HomeIcon,
      }}
      />
      <Tab.Screen name="Fruits" component={FruitExplorerScreen}
      options={{
        tabBarLabel: "Fruits",
        tabBarIcon: FruitIcon,
      }}
      />
      <Tab.Screen name="Cart" component={CartStack} 
      options={{
        tabBarLabel: "Cart",
        tabBarIcon: CartIcon,
      }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} 
      options={{
        tabBarLabel: "Profile",
        tabBarIcon: ProfileIcon,
      }}
      />
    </Tab.Navigator>
  );
}
