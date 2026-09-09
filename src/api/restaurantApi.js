import { apiClient } from './client';

export const getRestaurants = async () => {
  const response = await apiClient.get('/restaurants');
  return response.data;
};

export const getRestaurantById = async id => {
  const response = await apiClient.get(`/restaurants/${id}`);
  return response.data;
};

export const searchRestaurants = async query => {
  const response = await apiClient.get(`/restaurants/search`, {
    params: {
      query,
    },
  });
  return response.data;
};
