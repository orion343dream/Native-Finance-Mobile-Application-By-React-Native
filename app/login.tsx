
import * as AuthSession from 'expo-auth-session';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../src/auth/AuthContext';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  WebBrowser.maybeCompleteAuthSession();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Information', 'Please enter both email and password.');
      return;
    }
    try {
      await login(email, password);
      console.log('Login successful!');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'An unknown error occurred.');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const redirectUri = AuthSession.makeRedirectUri({});
      const discovery = {
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenEndpoint: 'https://oauth2.googleapis.com/token',
        revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
      };
      const clientId = '1737513953-i4askqbqfc8af7fdf8auc9d1tss4jalm.apps.googleusercontent.com';
      const scopes = ['openid', 'profile', 'email'];
      const authRequest = new AuthSession.AuthRequest({
        clientId,
        redirectUri,
        scopes,
        responseType: AuthSession.ResponseType.IdToken,
        usePKCE: false,
        extraParams: { nonce: Math.random().toString(36).slice(2), prompt: 'select_account' },
      });
      const result = await authRequest.promptAsync(discovery);
      if (result.type === 'success' && (result as any).params?.id_token) {
        const idToken = (result as any).params.id_token as string;
        Alert.alert('Google Sign-In', 'Google authentication successful');
        // TODO: verify idToken or exchange with backend / Firebase
      } else {
        Alert.alert('Google Sign-In', 'Cancelled or no token.');
      }
    } catch (e: any) {
      Alert.alert('Google Sign-In Failed', e?.message || 'Unknown error');
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

        <Text style={styles.header}>Welcome Back</Text>
        <Text style={styles.subtitle}>Log in to manage your finances.</Text>

        <TextInput
          style={styles.input}
          placeholder="Email address"
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

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Log In</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
          <Image source={{ uri: 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg' }} style={styles.googleIcon} />
          <Text style={styles.googleText}>Continue with Google</Text>
        </TouchableOpacity>

        <View style={styles.registerPromptContainer}>
          <Text style={styles.registerPromptText}>No account yet? </Text>
          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={styles.registerLink}>Register here</Text>
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
  loginButton: {
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
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 12,
  },
  googleIcon: { width: 20, height: 20, marginRight: 8 },
  googleText: { color: '#0f172a', fontWeight: '700' },
  registerPromptContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerPromptText: {
    fontSize: 14,
    color: '#475569',
  },
  registerLink: {
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

export default LoginScreen;
