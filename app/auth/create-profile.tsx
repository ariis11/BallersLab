import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';

const ProfileCreationScreen = () => {
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    avatar: '',
    dateOfBirth: '',
    height: '',
    weight: '',
    country: '',
    city: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = async () => {
    if (!form.firstName || !form.lastName || !form.username || !form.dateOfBirth || !form.height || !form.weight || !form.country || !form.city) {
      Alert.alert('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) throw new Error('No auth token found');
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/api/auth/complete-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          username: form.username,
          avatar: 'https://example.com/avatar.png',
          dateOfBirth: form.dateOfBirth,
          height: parseFloat(form.height),
          weight: parseFloat(form.weight),
          country: form.country,
          city: form.city,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Profile creation failed');
      
      await refreshUser();
      router.replace('/(protected)/(tabs)/tournaments');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>Set up your profile</Text>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="First Name"
          placeholderTextColor="#AAB1C7"
          value={form.firstName}
          onChangeText={text => handleChange('firstName', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          placeholderTextColor="#AAB1C7"
          value={form.lastName}
          onChangeText={text => handleChange('lastName', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#AAB1C7"
          value={form.username}
          onChangeText={text => handleChange('username', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Date of Birth (YYYY-MM-DD)"
          placeholderTextColor="#AAB1C7"
          value={form.dateOfBirth}
          onChangeText={text => handleChange('dateOfBirth', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Height (cm)"
          placeholderTextColor="#AAB1C7"
          value={form.height}
          onChangeText={text => handleChange('height', text.replace(/[^0-9.]/g, ''))}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Weight (kg)"
          placeholderTextColor="#AAB1C7"
          value={form.weight}
          onChangeText={text => handleChange('weight', text.replace(/[^0-9.]/g, ''))}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Country"
          placeholderTextColor="#AAB1C7"
          value={form.country}
          onChangeText={text => handleChange('country', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="City"
          placeholderTextColor="#AAB1C7"
          value={form.city}
          onChangeText={text => handleChange('city', text)}
        />
        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Done'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1121',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#181F33',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#00F0FF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#181F33',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default ProfileCreationScreen; 