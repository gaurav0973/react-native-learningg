import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

export function SearchBar({ searchText, setSearchText }) {
  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search for restaurants or food"
        value={searchText}
        onChangeText={setSearchText}
        style={styles.input}
        placeholderTextColor="#888888"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 24,
  },

  input: {
    backgroundColor: '#F4F4F4',

    borderRadius: 14,

    paddingHorizontal: 18,
    paddingVertical: 14,

    fontSize: 16,
  },
});
