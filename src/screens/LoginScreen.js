import React, { useRef } from 'react';
import {
  Keyboard,
  Button,
  Platform,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
} from 'react-native';
import { AppInput } from '../components/AppInput';
import { useLoginForm } from '../hooks/useLoginForm';

/**
 * 
 * KeyboardAvoidingView
  └── TouchableWithoutFeedback (tap to dismiss keyboard)
        └── ScrollView
              └── Email, Password, Login button

    - KeyboardAvoidingView => jab keyboard open hoga tb layout apne aap adjust kar lega
        - Android and IOS handles keyboard differnetly , so handle in the behaviour 
        - Platform.OS === 'ios' ? 'padding' : 'height'

    - TouchableWithoutFeedback
        - it is a touch wraper that     
            - detect taps (press event)
            - Does not show visual feedback (no highlight, ripple, or opacity change)
        - Used to tap teh background to close the keyboard without changing how UI looks 
    - ScrollView => keyboardShouldPersistTaps="handled"
        - This matters because without it, taps can be “eaten” by the keyboard/scroll layer.
 */

export default function LoginScreen() {
  const passwordRef = useRef(null);
  const {
    email,
    password,
    errors,
    loading,

    setEmail,
    setPassword,
    setLoading,

    validateEmail,
    validatePassword,
    validateForm,
  } = useLoginForm();

  async function submitLogin() {
    // dismiss the keyboard button in here
    Keyboard.dismiss();

    const isValid = validateForm();
    if (!isValid) {
      return;
    }

    try {
      setLoading(true);

      // API Call Here
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Login Successful');
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <AppInput
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            onBlur={validateEmail}
            keyboardType="email-address"
            autoComplete="email"
            autoCapitalize="none"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            error={errors.email}
          />

          <AppInput
            ref={passwordRef}
            label="Password"
            placeholder="Enter password"
            value={password}
            onChangeText={setPassword}
            onBlur={validatePassword}
            secureTextEntry
            autoComplete="password"
            returnKeyType="done"
            onSubmitEditing={submitLogin}
            error={errors.password}
          />

          <Button
            title={loading ? 'Signing In...' : 'Login'}
            disabled={loading}
            onPress={submitLogin}
          />
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
});
