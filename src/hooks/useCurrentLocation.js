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
      setLocation(null);
      // Ask for permission on Android
      if (Platform.OS === 'android') {
        /**
         * Location Premission
         *  - Is premissiion already granted
         *  - Yes => get location
         *  - No => ask Permission
         */
        const hasPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );

        if (!hasPermission) {
          const permission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          );

          /**
           * PermissionsAndroid.request() gives 3 things
           *    - GRANTED => uses says ki bhai meri location ka access le lo
           *    - DENIED => User says => No, not this time
           *    - NEVER_ASK_AGAIN => dont keep requesting => eventually guide user to setting
           */
          if (permission === PermissionsAndroid.RESULTS.DENIED) {
            throw new Error('Location permission denied');
          }

          if (permission === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
            throw new Error('Location permission permanently denied');
          }
        }
      }

      // Get current location
      Geolocation.getCurrentPosition(
        position => {
          setLocation(position.coords);
          setLoading(false);
        },
        e => {
          if (e.code === 3) {
            setError('Location request timed out');
          } else if (e.code === 2) {
            setError('Location is currently unavailable');
          } else {
            setError(e.message);
          }
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
