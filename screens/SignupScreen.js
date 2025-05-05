import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function SignupScreen() {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);

  // Animate fade in
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, []);

  async function handleSignup() {
    if (!email || !username || !password) {
      Alert.alert("Error", "Email, username, and password are required.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("https://wardrobe-backend-o0fr.onrender.com/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          username,
          password,
          first_name: firstName,
          last_name: lastName,
        }),
      });

      const data = await response.json();
      console.log("📨 Signup response status:", response.status);
      console.log("📨 Signup response data:", data);

      if (response.ok) {
        await AsyncStorage.setItem("user_id", data.user_id);
        await AsyncStorage.setItem("username", data.username);
        await AsyncStorage.setItem("first_name", data.first_name);

        navigation.replace("MainTabs");
      } else {
        Alert.alert("Signup Failed", data.detail || "Could not create account.");
      }
    } catch (error) {
      console.error("🚨 Signup Error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Animated.View style={[styles.inner, { opacity: fadeAnim }]}>
          <Image source={require("../assets/app_splash_screen.jpg")} style={styles.splashImage} />

          <View style={styles.signupContainer}>
            <Text style={styles.title}>Create an Account</Text>

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
              placeholder="Username"
              placeholderTextColor="#ccc"
              value={username}
              onChangeText={setUsername}
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
            <TextInput
              style={styles.input}
              placeholder="First Name"
              placeholderTextColor="#ccc"
              value={firstName}
              onChangeText={setFirstName}
            />
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              placeholderTextColor="#ccc"
              value={lastName}
              onChangeText={setLastName}
            />

            <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginLink} onPress={() => navigation.goBack()}>
              <Text style={styles.linkText}>Already have an account? Log in</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center" },
  inner: { flex: 1, width: "100%", alignItems: "center", justifyContent: "center" },
  splashImage: { position: "absolute", width: "100%", height: "100%", resizeMode: "cover" },
  signupContainer: {
    backgroundColor: "#111",
    padding: 20,
    width: "85%",
    borderRadius: 10,
    alignItems: "center",
    marginTop: "25%",
  },
  title: { color: "#fff", fontSize: 20, fontWeight: "bold", marginBottom: 15 },
  input: {
    width: "100%",
    backgroundColor: "#222",
    padding: 12,
    borderRadius: 5,
    marginBottom: 10,
    color: "#fff",
  },
  signupButton: {
    width: "100%",
    backgroundColor: "#ff4757",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  loginLink: { marginTop: 15 },
  linkText: { color: "#ccc", textDecorationLine: "underline" },
});
