const BASE_URL = 'https://www.fruityvice.com/api';

export async function getAllFruits() {
  const response = await fetch(`${BASE_URL}/fruit/all`);
  if (!response.ok) {
    throw new Error('Failed to fetch fruits.');
  }
  const fruits = await response.json();
  return fruits;
}
