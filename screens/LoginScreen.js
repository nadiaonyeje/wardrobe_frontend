import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import * as AppleAuthentication from "expo-apple-authentication";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const navigation = useNavigation();
  const [showButtons, setShowButtons] = useState(false);
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: "344547594302-qrgsdh4thgbd2ocv56t4un8jgab939kh.apps.googleusercontent.com",
    redirectUri: "https://auth.expo.io/@your-username/your-app-slug", // Replace this!
  });

  useEffect(() => {
    setTimeout(() => {
      setShowButtons(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }, 1000);
  }, []);

  useEffect(() => {
    if (response?.type === "success") {
      fetchGoogleUserInfo(response.authentication.accessToken);
    }
  }, [response]);

  async function fetchGoogleUserInfo(accessToken) {
    try {
      const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const userInfo = await res.json();

      await handleSocialLogin({
        email: userInfo.email,
        username: userInfo.name,
        first_name: userInfo.given_name,
        last_name: userInfo.family_name,
      });
    } catch (error) {
      console.error("Google Login Error:", error);
    }
  }

  async function signInWithApple() {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      await handleSocialLogin({
        email: credential.email,
        username: credential.email,
        first_name: credential.fullName?.givenName || "User",
        last_name: credential.fullName?.familyName || "",
      });
    } catch (error) {
      console.error("Apple Sign-In Error:", error);
    }
  }

  async function handleSocialLogin(profile) {
    try {
      const res = await fetch("https://wardrobe-backend-o0fr.onrender.com/social-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      const data = await res.json();

      if (res.ok && data.user_id) {
        await AsyncStorage.setItem("user_id", data.user_id);
        await AsyncStorage.setItem("username", data.username);
        await AsyncStorage.setItem("first_name", data.first_name);

        navigation.replace("MainTabs");
      } else {
        Alert.alert("Login Failed", "Could not complete social login.");
      }
    } catch (error) {
      console.error("Social login error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  }

  async function handleEmailLogin() {
    if (!emailOrUsername || !password) {
      Alert.alert("Error", "Please enter both email/username and password.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("https://wardrobe-backend-o0fr.onrender.com/token/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email_or_username: emailOrUsername,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem("user_id", data.user_id);
        await AsyncStorage.setItem("username", data.username);
        await AsyncStorage.setItem("first_name", data.first_name);

        navigation.replace("MainTabs");
      } else {
        Alert.alert("Login Failed", data.detail || "Invalid credentials.");
      }
    } catch (error) {
      console.error("🚨 Login Error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <Image source={require("../assets/app_splash_screen.jpg")} style={styles.splashImage} />

          {showEmailLogin && (
            <View style={styles.emailLoginContainer}>
              <Text style={styles.text}>Sign in with Username or Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Username or Email"
                placeholderTextColor="#ccc"
                value={emailOrUsername}
                onChangeText={setEmailOrUsername}
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
              <TouchableOpacity style={styles.continueButton} onPress={handleEmailLogin}>
                {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.buttonText}>Continue</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.backButton} onPress={() => setShowEmailLogin(false)}>
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            </View>
          )}

          {!showEmailLogin && showButtons && (
            <Animated.View style={[styles.signInContainer, { opacity: fadeAnim }]}>
              <TouchableOpacity style={styles.appleButton} onPress={signInWithApple}>
                <Image source={require("../assets/apple-logo.png")} style={styles.logo} />
                <Text style={styles.buttonText}>Continue with Apple</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.googleButton} disabled={!request} onPress={() => promptAsync()}>
                <Image source={require("../assets/google-logo.png")} style={styles.logo} />
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.emailButton} onPress={() => setShowEmailLogin(true)}>
                <Image source={require("../assets/email-logo.png")} style={styles.logo} />
                <Text style={styles.buttonText}>Continue with Email</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate("SignupScreen")} style={styles.signupLink}>
                <Text style={styles.linkText}>Don't have an account? Sign up</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center" },
  inner: { flex: 1, width: "100%", alignItems: "center", justifyContent: "center" },
  splashImage: { position: "absolute", width: "100%", height: "100%", resizeMode: "cover" },
  signInContainer: { position: "absolute", bottom: 40, width: "100%", alignItems: "center" },
  emailLoginContainer: {
    position: "absolute",
    width: "85%",
    alignItems: "center",
    backgroundColor: "#111",
    padding: 20,
    borderRadius: 10,
    top: "35%",
  },
  input: {
    width: "100%",
    backgroundColor: "#222",
    padding: 12,
    borderRadius: 5,
    marginBottom: 10,
    color: "#fff",
  },
  continueButton: {
    width: "100%",
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  backButton: { marginTop: 10 },
  backButtonText: { fontSize: 14, color: "#fff", textDecorationLine: "underline" },
  appleButton: {
    flexDirection: "row",
    width: "80%",
    backgroundColor: "black",
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  googleButton: {
    flexDirection: "row",
    width: "80%",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  emailButton: {
    flexDirection: "row",
    width: "80%",
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: { width: 20, height: 20, marginRight: 10 },
  buttonText: { fontSize: 16, color: "#fff" },
  googleButtonText: { fontSize: 16, color: "#000" },
  text: { fontSize: 16, color: "#fff", marginBottom: 20 },
  signupLink: { marginTop: 15 },
  linkText: { fontSize: 14, color: "#ccc", textDecorationLine: "underline" },
});
