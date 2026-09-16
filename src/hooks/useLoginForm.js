import { useState } from 'react';
import { isValidEmail, isValidPassword } from '../utils/validators';

export function useLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({email: '',password: ''});
  const [loading, setLoading] = useState(false);


  const validateEmail = () => {
    const error = isValidEmail(email);
    setErrors(prev => ({
      ...prev,
      email: error,
    }));
    return error === '';
  };
  const validatePassword = () => {
    const error = isValidPassword(password);
    setErrors(prev => ({
      ...prev,
      password: error,
    }));
    return error === '';
  };

  const validateForm = () => {
    const emailValid = validateEmail();
    const passwordValid = validatePassword();
    return emailValid && passwordValid;
  };

  return {
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
  };
}
