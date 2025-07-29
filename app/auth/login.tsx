import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
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
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();
  const isMountedRef = useRef(true);
  const navigationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    if (loading) return; // Prevent multiple submissions

    setError('');
    setLoading(true);
    
    try {
      await login({ email: email.trim(), password });
      if (isMountedRef.current) {
        router.replace('/(protected)/(tabs)/tournaments');
      }
    } catch (error: any) {
      if (isMountedRef.current) {
        setError('Invalid credentials');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handleNavigateToRegister = () => {
    if (loading || navigationTimeoutRef.current) return;
    
    navigationTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        router.push('/auth/register');
      }
      navigationTimeoutRef.current = null;
    }, 100);
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
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#A0AEC0"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (error) setError('');
          }}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#A0AEC0"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (error) setError('');
          }}
          secureTextEntry
        />
        <TouchableOpacity style={styles.forgotContainer}>
          <Text style={styles.forgotText}>Forgot your password?</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.loginButton,
            loading ? styles.loginButtonDisabled : null
          ]}
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
        <TouchableOpacity onPress={handleNavigateToRegister}>
          <Text style={styles.createNowText}>Create now</Text>
        </TouchableOpacity>
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
  errorContainer: {
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
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
  loginButtonDisabled: {
    backgroundColor: '#4A5568',
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