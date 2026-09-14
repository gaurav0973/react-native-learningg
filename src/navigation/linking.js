export const linking = {
  //   which url belongd to this app => first://anothing
  prefixes: ['first://'],

  //   config.screens => map url with the screen
  config: {
    screens: {
      Home: {
        screens: {
          HomeScreen: '',
          RestaurantScreen: 'restaurant/:restaurantId',
        },
      },
      Cart: {
        screens: {
          // match your CartStack screen names
        },
      },
      Profile: 'profile',
      // Fruits: 'fruits'  // if you want it linkable
    },
  },
};
