import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AddressCard } from '../components/AddressCart';
import { useAddress } from '../context/AddressContext';
import { useCurrentLocation } from '../hooks/useCurrentLocation';

const EMPTY_FORM = {
  label: '',
  houseNumber: '',
  street: '',
  city: '',
  pincode: '',
};

export function AddressScreen({ navigation }) {
  const { addresses, addAddress, selectAddress, deleteAddress } = useAddress();
  const [form, setForm] = useState(EMPTY_FORM);
  const { location, loading, error, fetchLocation } = useCurrentLocation();
  console.log('Location', location);

  const updateField = (field, value) => {
    setForm(previous => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSaveAddress = () => {
    if (
      !form.label ||
      !form.houseNumber ||
      !form.street ||
      !form.city ||
      !form.pincode
    ) {
      return;
    }

    addAddress(form);
    setForm(EMPTY_FORM);
  };

  const handleSelectAddress = addressId => {
    selectAddress(addressId);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlashList
        data={addresses}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <AddressCard
            address={item}
            onSelect={handleSelectAddress}
            onDelete={deleteAddress}
          />
        )}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Delivery Address</Text>
              <Text style={styles.subtitle}>
                Choose where we should deliver your food.
              </Text>
            </View>
            <Pressable
              style={[
                styles.locationButton,
                loading && styles.locationButtonDisabled,
              ]}
              onPress={fetchLocation}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.locationText}>Use Current Location</Text>
              )}
            </Pressable>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            {location ? (
              <View style={styles.locationCard}>
                <Text style={styles.locationCardTitle}>Current Location</Text>
                <Text style={styles.locationDetail}>
                  Latitude: {location.latitude.toFixed(6)}
                </Text>
                <Text style={styles.locationDetail}>
                  Longitude: {location.longitude.toFixed(6)}
                </Text>
                <Text style={styles.locationDetail}>
                  Accuracy: {Math.round(location.accuracy)} meters
                </Text>
              </View>
            ) : null}

            <Text style={styles.sectionTitle}>Saved Addresses</Text>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Saved Address</Text>
            <Text style={styles.emptyText}>
              Add your first delivery address below.
            </Text>
          </View>
        }
        ListFooterComponent={
          <>
            <Text style={styles.sectionTitle}>Add New Address</Text>

            <TextInput
              placeholder="Home / Office / Hostel"
              value={form.label}
              onChangeText={value => updateField('label', value)}
              style={styles.input}
            />

            <TextInput
              placeholder="House Number"
              value={form.houseNumber}
              onChangeText={value => updateField('houseNumber', value)}
              style={styles.input}
            />

            <TextInput
              placeholder="Street / Area"
              value={form.street}
              onChangeText={value => updateField('street', value)}
              style={styles.input}
            />

            <TextInput
              placeholder="City"
              value={form.city}
              onChangeText={value => updateField('city', value)}
              style={styles.input}
            />

            <TextInput
              placeholder="Pincode"
              keyboardType="number-pad"
              value={form.pincode}
              onChangeText={value => updateField('pincode', value)}
              style={styles.input}
            />

            <Pressable style={styles.saveButton} onPress={handleSaveAddress}>
              <Text style={styles.saveButtonText}>Save Address</Text>
            </Pressable>
          </>
        }
        contentContainerStyle={styles.content}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    marginBottom: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
  },

  subtitle: {
    marginTop: 8,
    color: '#666666',
    fontSize: 15,
  },

  sectionTitle: {
    marginVertical: 18,
    fontSize: 18,
    fontWeight: '700',
  },

  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
    fontSize: 15,
  },

  saveButton: {
    backgroundColor: '#16A34A',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },

  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
  },

  emptyText: {
    marginTop: 6,
    color: '#777777',
  },

  locationButton: {
    backgroundColor: '#16A34A',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },

  locationButtonDisabled: {
    opacity: 0.7,
  },

  locationText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  locationCard: {
    marginTop: 16,
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
  },

  locationCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    color: '#065F46',
  },

  locationDetail: {
    fontSize: 14,
    color: '#047857',
    marginTop: 4,
  },

  error: {
    color: '#DC2626',
    marginTop: 12,
    fontSize: 14,
  },
});
