import { forwardRef } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

/**
 * Parmas
 *  - label => accesibility and clearity
 *  - helperTextx => instriction begfore error
 *  - error => inline validation state
 *  - ...proeps > makes component reusable for every input
 * What is this forwardRef ? +> concept => ref fprwarding  
 *  - Without it => LoginScreen => appInput => TextInput 
 *      - passwordRef.current.focus() won't reach TextInput
 *  - With forwardRef => LoginScreen => AppInput => TextInput (ref reches here)
 * 
 */

export const AppInput = forwardRef(({ label, helperText, error, ...props }, ref) => {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          ref={ref}
          style={[styles.input, error && styles.inputError]}
          {...props}
        />

        {helperText && !error && (
          <Text style={styles.helperText}>{helperText}</Text>
        )}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  helperText: {
    color: '#6B7280',
    marginTop: 6,
  },
  errorText: {
    color: '#EF4444',
    marginTop: 6,
  },
});
