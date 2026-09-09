import React from "react";
import { Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function SearchScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>
        Search Screen
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    justifyContent:"center",
    alignItems:"center",
  },

  title:{
    fontSize:28,
    fontWeight:"700",
  }
});