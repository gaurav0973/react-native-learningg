import { View, Text, Pressable, StyleSheet } from 'react-native';

export function AddressCard({ address, onSelect, onDelete }) {
  return (
    <Pressable
      onPress={() => onSelect(address.id)}
      style={[styles.container, address.isSelected && styles.selectedContainer]}
    >
      <View style={styles.content}>
        <Text style={styles.label}>{address.label}</Text>

        <Text style={styles.street}>
          {address.houseNumber}, {address.street}
        </Text>

        <Text style={styles.city}>
          {address.city} • {address.pincode}
        </Text>
      </View>

      {address.isSelected ? (
        <Text style={styles.selectedText}>✓ Selected Address</Text>
      ) : (
        <Text style={styles.deliverText}>Deliver Here</Text>
      )}

      {onDelete && (
        <Pressable
          onPress={event => {
            event.stopPropagation();
            onDelete(address.id);
          }}
          style={styles.deleteButton}
        >
          <Text style={styles.deleteText}>Remove</Text>
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },

  selectedContainer: {
    borderColor: '#16A34A',
    borderWidth: 2,
  },

  label: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },

  street: {
    fontSize: 15,
    color: '#444444',
    marginBottom: 6,
  },

  city: {
    fontSize: 14,
    color: '#777777',
  },

  selectedText: {
    marginTop: 16,
    color: '#16A34A',
    fontWeight: '600',
  },

  deliverText: {
    marginTop: 16,
    color: '#666666',
  },

  deleteButton: {
    marginTop: 14,
    alignSelf: 'flex-start',
  },

  deleteText: {
    color: '#DC2626',
    fontWeight: '600',
  },
});
