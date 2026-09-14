export const linking = {

//   which url belongd to this app => first://anothing 
  prefixes: ['first://'],

//   config.screens => map url with the screen
  config: {
    screens: {
      Home: '',
      Cart: 'cart',
      Offers: 'offers',
      Profile: 'profile',
      RestaurantDetails: 'restaurant/:restaurantId',
    },
  },
};
