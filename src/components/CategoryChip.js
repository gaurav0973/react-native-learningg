import { StyleSheet, Text, View } from 'react-native';

export function CategoryChip({ title }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: '#FFF2E8',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 999,
    marginRight: 12,
  },
  chipText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF6B35',
  },
});
