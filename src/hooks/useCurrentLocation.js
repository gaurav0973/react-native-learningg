import { useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export function useCurrentLocation() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLocation = async () => {
    try {
      setLoading(true);
      setError(null);
      // Ask for permission on Android
      if (Platform.OS === 'android') {
        const permission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );

        if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
          throw new Error('Location permission denied');
        }
      }

      // Get current location
      Geolocation.getCurrentPosition(
        position => {
          setLocation(position.coords);
          setLoading(false);
        },
        e => {
          setError(e.message);
          setLoading(false);
        },
      );
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };


  return {
    location,
    loading,
    error,
    fetchLocation,
  };
}
