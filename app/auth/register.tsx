// app/auth/register.tsx
import { useAuth } from '@/hooks/useAuth';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

function validatePassword(password: string) {
  // At least 8 chars, one letter, one number
  const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  if (!password) return 'Password is required.';
  if (!re.test(password)) return 'Password must be at least 8 characters and include a letter and a number.';
  return '';
}

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [emailError, setEmailError] = useState('');
  const router = useRouter();
  const { register } = useAuth();

  const handleRegister = async () => {
    let valid = true;
    setEmailError('');
    setPasswordError('');
    setConfirmError('');

    if (!email.trim()) {
      setEmailError('Email is required.');
      valid = false;
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setEmailError('Enter a valid email address.');
      valid = false;
    }

    const pwdError = validatePassword(password);
    if (pwdError) {
      setPasswordError(pwdError);
      valid = false;
    }

    if (!confirmPassword) {
      setConfirmError('Please confirm your password.');
      valid = false;
    } else if (password !== confirmPassword) {
      setConfirmError('Passwords do not match.');
      valid = false;
    }

    if (!valid) return;

    setLoading(true);
    try {
      await register({ email: email.trim(), password });
      router.replace('/(protected)/(tabs)/(home)');
    } catch (error: any) {
      if (error.message && error.message.includes('Email already registered')) {
        setEmailError('Email already registered');
      } else {
        Alert.alert('Registration failed', error.message || 'Could not create account');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.logoContainer}>
        <Image source={require('@/assets/images/logo.png')} style={styles.logo} />
        <Text style={styles.appName}>BallersLab</Text>
      </View>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#A0AEC0"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        {!!emailError && <Text style={styles.errorText}>{emailError}</Text>}
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#A0AEC0"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {!!passwordError && <Text style={styles.errorText}>{passwordError}</Text>}
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#A0AEC0"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        {!!confirmError && <Text style={styles.errorText}>{confirmError}</Text>}
        <TouchableOpacity
          style={styles.registerButton}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#181F2A" />
          ) : (
            <Text style={styles.registerButtonText}>Create account</Text>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <Link href="/auth/login" asChild>
          <TouchableOpacity>
            <Text style={styles.signInText}>Sign in</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181F2A',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 8,
  },
  appName: {
    fontFamily: 'SpaceMono',
    fontSize: 32,
    color: '#E6F6FF',
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  form: {
    width: '100%',
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#232B3A',
    color: '#E6F6FF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 8,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 13,
    marginBottom: 8,
    marginLeft: 4,
  },
  registerButton: {
    backgroundColor: '#00E6FF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 8,
  },
  registerButtonText: {
    color: '#181F2A',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  footerText: {
    color: '#A0AEC0',
    fontSize: 14,
  },
  signInText: {
    color: '#00E6FF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});