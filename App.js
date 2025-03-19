import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  ActivityIndicator,
} from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';

WebBrowser.maybeCompleteAuthSession();

export default function App() {
  const [showButtons, setShowButtons] = useState(false);
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // NEW: Tracks login loading state

  const fadeAnim = useRef(new Animated.Value(0)).current; // Animation Value

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId:
      '344547594302-qrgsdh4thgbd2ocv56t4un8jgab939kh.apps.googleusercontent.com',
  });

  useEffect(() => {
    setTimeout(() => {
      setShowButtons(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }, 3000);
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      console.log('Google User Info:', response.authentication);
    }
  }, [response]);

  async function signInWithApple() {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      console.log('Apple User Info:', credential);
    } catch (error) {
      console.error('Apple Sign-In Error:', error);
    }
  }

  async function handleEmailLogin() {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      console.log('Sending request to backend with:', email, password); // ✅ LOG REQUEST DETAILS

      const response = await fetch(
        'https://wardrobe-backend-g9an.onrender.com/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        }
      );

      console.log('Response Status:', response.status); // ✅ LOG RESPONSE STATUS

      const data = await response.json();
      console.log('Response Data:', data); // ✅ LOG RESPONSE BODY

      if (response.ok) {
        Alert.alert('Success', 'Logged in successfully!');
        console.log('User Info:', data);
        // TODO: Navigate to Home Screen after successful login
      } else {
        Alert.alert('Login Failed', data.message || 'Invalid credentials.');
      }
    } catch (error) {
      console.error('Login Error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          {/* Background Splash Image */}
          <Image
            source={require('./assets/app_splash_screen.jpg')}
            style={styles.splashImage}
          />

          {/* Blur effect when email login is open */}
          {showEmailLogin && <View style={styles.overlay} />}

          {/* Email Login Page */}
          {showEmailLogin && (
            <View style={styles.emailLoginContainer}>
              <Text style={styles.text}>Sign in with Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#ccc"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#ccc"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <TouchableOpacity
                style={styles.continueButton}
                onPress={handleEmailLogin}>
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Continue</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setShowEmailLogin(false)}>
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Main Sign-In Page with Fade-In Effect */}
          {!showEmailLogin && showButtons && (
            <Animated.View
              style={[styles.signInContainer, { opacity: fadeAnim }]}>
              <TouchableOpacity
                style={styles.appleButton}
                onPress={signInWithApple}>
                <Image
                  source={require('./assets/apple-logo.png')}
                  style={styles.logo}
                />
                <Text style={styles.buttonText}>Continue with Apple</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.googleButton}
                disabled={!request}
                onPress={() => promptAsync()}>
                <Image
                  source={require('./assets/google-logo.png')}
                  style={styles.logo}
                />
                <Text style={styles.googleButtonText}>
                  Continue with Google
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.emailButton}
                onPress={() => setShowEmailLogin(true)}>
                <Image
                  source={require('./assets/email-logo.png')}
                  style={styles.logo}
                />
                <Text style={styles.buttonText}>Continue with Email</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inner: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black overlay
  },
  signInContainer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  emailLoginContainer: {
    position: 'absolute',
    width: '85%', // Restore previous width
    alignItems: 'center',
    backgroundColor: '#111',
    padding: 20,
    borderRadius: 10,
    top: '35%',
  },
  input: {
    width: '100%', // Restore full width of input fields
    backgroundColor: '#222',
    padding: 12,
    borderRadius: 5,
    marginBottom: 10,
    color: '#fff',
  },
  continueButton: {
    width: '100%',
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  backButton: {
    marginTop: 10,
  },
  backButtonText: {
    fontSize: 14,
    color: '#fff',
    textDecorationLine: 'underline',
  },
  appleButton: {
    flexDirection: 'row',
    width: '80%',
    backgroundColor: 'black',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    width: '80%',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailButton: {
    flexDirection: 'row',
    width: '80%',
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
  },
  googleButtonText: {
    fontSize: 16,
    color: '#000',
  },
  text: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 20,
  },
});
