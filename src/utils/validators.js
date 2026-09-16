export function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim()) return 'Email is required';
  if (!regex.test(email)) return 'Enter a valid email';
  return '';
}

export function isValidPassword(password) {
  if (!password.trim()) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  return '';
}
