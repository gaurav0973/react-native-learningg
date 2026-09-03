import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function Header() {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.label}>Deliver To</Text>

        <Text style={styles.location}>Chandigarh, Punjab</Text>
      </View>

      <View style={styles.profile}>
        <Text style={styles.profileText}>GM</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  label: {
    fontSize: 14,
    color: '#777777',
  },

  location: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    marginTop: 4,
  },

  profile: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
  },
});

export default Header;
