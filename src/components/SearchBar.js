import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

/**
 *
 * searchBar
 * - icon  textInput
 */
export function SearchBar() {
  const [searchText, setSearchText] = useState('');

  function handlePress() {
    console.log('Button is pressed');
  }

  return (
    <Pressable onPress={handlePress}>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle} />
        </View>

        {/* <View
           pointerEvents="none"
        > */}
        <TextInput
           
           style={styles.input}
           placeholder="Search for food or restaurants"
           placeholderTextColor="#000"
           value={searchText}
           onChangeText={setSearchText}
         />
        </View>
      {/* </View> */}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',

    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 14,

    backgroundColor: '#F4F4F4',
    borderRadius: 14,
  },

  iconContainer: {
    marginRight: 12,
  },

  iconCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#777777',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    backgroundColor: 'blue',
  },
});
