import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AddressCard } from '../components/AddressCart';
import { useAddress } from '../context/AddressContext';

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
});
