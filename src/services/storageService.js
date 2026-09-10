import { createAsyncStorage } from "@react-native-async-storage/async-storage";
export const STORAGE_KEYS = {
  CART: 'cart_items',
  TOKEN: 'auth_token',
  USER: 'user_details',
  ADDRESSES: "saved_addresses",
};

const cartStorage = createAsyncStorage("cartStorage");


//1. save data to storage
export const saveData = async (key, value) => {
  try {
    // console.log("data saved start")
    await cartStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.log('Storage Save Error', error);
  }
};

//2. get the stored data
export const getData = async (key) => {
  try {
    const value = await cartStorage.getItem(key);
    // console.log("Data get from the localstorage: ", value)
    // if value is not null, then parse the value and return it
    if (value !== null) {
      return JSON.parse(value);
    }
    // if value is null, then return null
    return null;
  } catch (error) {
    console.log('Storage Read Error', error);
    return null;
  }
};

//3. remove the stored data => logout ye clearing cart
export const removeData = async (key) => {
  try {
    await cartStorage.removeItem(key);
  } catch (error) {
    console.log('Storage Remove Error', error);
  }
};

//4. clear everything => debug utility
export const clearStorage = async () => {
  try {
    await cartStorage.clear();
  } catch (error) {
    console.log('Storage Clear Error', error);
  }
};
