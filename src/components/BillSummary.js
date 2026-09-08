import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function BillRow({ title, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{title}</Text>
      <Text style={styles.value}>₹{value}</Text>
    </View>
  );
}

export function BillSummary({ subtotal, deliveryFee, gst, total }) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Bill Details</Text>
      <BillRow title="Subtotal" value={subtotal} />
      <BillRow title="Delivery Fee" value={deliveryFee} />
      <BillRow title="GST" value={gst} />
      <View style={styles.divider} />
      <BillRow title="To Pay" value={total} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    paddingTop: 20,

    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },

  heading: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',

    marginBottom: 14,
  },

  label: {
    color: '#555555',
    fontSize: 16,
  },

  value: {
    fontWeight: '600',
    fontSize: 16,
  },

  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    marginVertical: 18,
  },
});
