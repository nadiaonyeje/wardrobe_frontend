import React, { useRef, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Keyboard,
} from "react-native";
import { WebView } from "react-native-webview";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function BrowserScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUrl, setCurrentUrl] = useState("https://www.google.com/");
  const [loading, setLoading] = useState(false);
  const webviewRef = useRef(null);

  const handleSearch = () => {
    Keyboard.dismiss();
    const query = searchQuery.trim();
    const isURL = query.startsWith("http://") || query.startsWith("https://");

    const url = isURL ? query : `https://www.google.com/search?q=${query.replace(/\s+/g, "+")}`;
    setCurrentUrl(url);
  };

  const handleSave = async () => {
    const userId = await AsyncStorage.getItem("user_id");

    if (!userId) {
      Alert.alert("Error", "User ID not found.");
      return;
    }

    try {
      const response = await fetch("https://wardrobe-backend-o0fr.onrender.com/save-item/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: currentUrl, users_id: userId }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Saved", "Item added to your wardrobe.");
      } else {
        Alert.alert("Error", data.detail || "Could not save item.");
      }
    } catch (err) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchBar}>
        <TextInput
          placeholder="Search or paste product link..."
          placeholderTextColor="#aaa"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          style={styles.input}
        />
        <TouchableOpacity onPress={handleSearch}>
          <Ionicons name="search" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* WebView browser */}
      <WebView
        ref={webviewRef}
        source={{ uri: currentUrl }}
        onNavigationStateChange={(navState) => setCurrentUrl(navState.url)}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        style={styles.webview}
      />

      {/* Loading spinner */}
      {loading && <ActivityIndicator size="large" color="#ff4757" style={styles.loader} />}

      {/* Save button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save to Wardrobe</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  input: {
    flex: 1,
    color: "#fff",
    marginRight: 10,
    fontSize: 14,
  },
  webview: { flex: 1 },
  loader: {
    position: "absolute",
    top: "50%",
    alignSelf: "center",
  },
  saveButton: {
    backgroundColor: "#ff4757",
    paddingVertical: 16,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});