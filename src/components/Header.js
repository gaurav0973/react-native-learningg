import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

export function Header() {
  const navigation = useNavigation();
  const handleProfilePressButton = () => {
    return navigation.navigate('Profile');
  };
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.label}>Deliver To</Text>
        <Text style={styles.location}>Chandigarh, Punjab</Text>
      </View>
      <Pressable onPress={handleProfilePressButton}>
        <View style={styles.profile}>
          <Text style={styles.profileText}>GM</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexShrink: 0,
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
