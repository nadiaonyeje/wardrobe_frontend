// screens/WardrobeScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ItemCard from "../components/ItemCard"; // Make sure you have one

export default function WardrobeScreen() {
  const [ownership, setOwnership] = useState("own"); // default view
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    const userId = await AsyncStorage.getItem("user_id");
    if (!userId) return;

    try {
      setLoading(true);
      const res = await fetch(
        `https://wardrobe-backend-o0fr.onrender.com/items/${userId}/ownership/${ownership}`
      );
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error("Error fetching items", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [ownership]);

  return (
    <View style={styles.container}>
      <View style={styles.toggleRow}>
        <TouchableOpacity
          onPress={() => setOwnership("own")}
          style={[
            styles.toggleButton,
            ownership === "own" && styles.activeButton,
          ]}
        >
          <Text style={styles.toggleText}>Own</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setOwnership("wishlist")}
          style={[
            styles.toggleButton,
            ownership === "wishlist" && styles.activeButton,
          ]}
        >
          <Text style={styles.toggleText}>Wishlist</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#ff4757" />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ItemCard item={item} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", padding: 10 },
  toggleRow: { flexDirection: "row", justifyContent: "center", marginBottom: 10 },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    backgroundColor: "#333",
    marginHorizontal: 5,
  },
  activeButton: {
    backgroundColor: "#ff4757",
  },
  toggleText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
