
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../src/auth/AuthContext';

const RegisterScreen = () => {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    try {
      if (!name.trim() || !email.trim() || !password) {
        Alert.alert('Missing Information', 'Please fill all fields.');
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert('Password Mismatch', 'Password and Confirm Password must match.');
        return;
      }
      await register(name, email, password);
      console.log('Registration successful!');
    } catch (error: any) {
      alert(`Registration failed: ${error.message}`);
    }
  };

  return (
    <LinearGradient colors={["#ecfdf5", "#d1fae5"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
      <View style={styles.decorTopRight} />
      <View style={styles.decorBottomLeft} />
      <View style={styles.container}>
        <View style={styles.brandRow}>
          <Image source={require('../assets/images/Gemini_Generated_Image_4iaitt4iaitt4iai.png')} style={styles.logo} />
          <Text style={styles.brand}>Native Finance</Text>
        </View>

        <Text style={styles.header}>Create Account</Text>
        <Text style={styles.subtitle}>Get started with your personal finance tracker.</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor="#64748b"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          blurOnSubmit={false}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#64748b"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          blurOnSubmit={false}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#64748b"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          blurOnSubmit={false}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#64748b"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.registerButtonText}>Create Account</Text>
        </TouchableOpacity>

        <View style={styles.loginPromptContainer}>
          <Text style={styles.loginPromptText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.loginLink}>Log in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  logo: { width: 90, height: 90, borderRadius: 28, marginRight: 15 },
  brand: { fontSize: 40, fontWeight: '900', color: '#047857' },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#047857',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#64748b',
    marginBottom: 32,
  },
  input: {
    height: 50,
    borderColor: '#cbd5e1',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    fontSize: 16,
  },
  registerButton: {
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#059669',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  loginPromptContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginPromptText: {
    fontSize: 14,
    color: '#475569',
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#059669',
  },
  decorTopRight: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#bbf7d0',
    right: -60,
    top: -40,
  },
  decorBottomLeft: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#a7f3d0',
    left: -80,
    bottom: -60,
  },
});

export default RegisterScreen;
