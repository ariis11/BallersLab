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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }
    setLoading(true);
    try {
      await login({ email: email.trim(), password });
      // Navigate to main app (tabs)
      router.replace('/(protected)/(tabs)/tournaments');
    } catch (error: any) {
      Alert.alert('Login failed', error.message || 'Invalid credentials');
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
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#A0AEC0"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.forgotContainer}>
          <Text style={styles.forgotText}>Forgot your password?</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#181F2A" />
          ) : (
            <Text style={styles.loginButtonText}>Log in</Text>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Don&apos;t have account? </Text>
        <Link href="/auth/register" asChild>
          <TouchableOpacity>
            <Text style={styles.createNowText}>Create now</Text>
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
    marginBottom: 16,
  },
  forgotContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    color: '#A0AEC0',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#00E6FF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  loginButtonText: {
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
  createNowText: {
    color: '#00E6FF',
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 