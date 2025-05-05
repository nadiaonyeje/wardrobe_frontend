import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Image,
  Modal,
  Pressable,
  Linking,
  SafeAreaView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";

export default function HomeScreen() {
  const [link, setLink] = useState("");
  const [items, setItems] = useState([]);
  const [firstName, setFirstName] = useState("User");
  const [usersId, setUsersId] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const init = async () => {
      const id = await AsyncStorage.getItem("user_id");
      const name = await AsyncStorage.getItem("first_name");
      setUsersId(id);
      if (name) setFirstName(name);
      if (id) fetchItems(id);
    };
    init();
  }, []);

  async function fetchItems(id) {
    try {
      const response = await fetch(`https://wardrobe-backend-o0fr.onrender.com/items/${id}`);
      const data = await response.json();
      if (response.ok) setItems(data);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  }

  async function handleSaveLink() {
  if (!link.trim() || !usersId) return;

  const isValidUrl = /^https?:\/\/\S+$/.test(link.trim());
if (!isValidUrl) {
  alert("Please paste a valid link.");
  return;
}

  const isDuplicate = items.some(item => item.source === link.trim());
  if (isDuplicate) {
    setLink("");              // Clear the link if it's a duplicate
    Keyboard.dismiss();       // Hide keyboard
    return;
  }

  try {
    const response = await fetch("https://wardrobe-backend-o0fr.onrender.com/save-item/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: link, users_id: usersId }),
    });

    const newItem = await response.json();

    if (response.ok && newItem.id) {
      setLink("");              // Clear input first
      Keyboard.dismiss();       // Dismiss keyboard
      setItems(prev => [newItem, ...prev]); // Insert new item
    } else {
      console.error("Failed to save:", newItem);
    }
  } catch (error) {
    console.error("Error saving:", error);
  }
}

  const handleOpenItem = (item) => {
    navigation.navigate("ItemDetails", { item });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined} 
        keyboardVerticalOffset={90}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            <View style={styles.topContent}>
              <Text style={styles.helloText}>Hello, <Text style={styles.boldText}>{firstName}</Text></Text>
              <Text style={styles.recentText}>⚡ Recent Saves</Text>
            </View>

            <FlatList
              data={items}
              keyExtractor={(item) => item.id || item._id}
              numColumns={2}
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                await fetchItems(usersId);
                setRefreshing(false);
              }}
              contentContainerStyle={styles.scrollArea}
              columnWrapperStyle={{ justifyContent: "space-between" }}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.gridItem} onPress={() => handleOpenItem(item)}>
                  <Image source={{ uri: item.image_url }} style={styles.itemImage} />
                  <Text style={styles.itemTitle} numberOfLines={1} ellipsizeMode="tail">
                    {item.title}
                  </Text>

                  {item.price ? (
                    <Text style={styles.itemPrice}>{item.price}</Text>
                  ) : (
                    <View style={styles.priceUnavailableRow}>
                      <Text style={styles.priceUnavailable}>Price unavailable</Text>
                      <TouchableOpacity onPress={() => setShowInfo(true)}>
                        <Ionicons name="information-circle-outline" size={14} color="#999" />
                      </TouchableOpacity>
                    </View>
                  )}

                  <View style={styles.siteRow}>
                    {item.site_icon_url ? (
                      <Image source={{ uri: item.site_icon_url }} style={styles.siteIcon} />
                    ) : null}
                    <Text style={styles.itemSource}>{item.site_name || "Unknown"}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />

            <View style={styles.linkBar}>
              <TextInput
                style={styles.input}
                placeholder="Paste link here..."
                placeholderTextColor="#ccc"
                value={link}
                onChangeText={setLink}
              />
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveLink}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>

            <Modal
              transparent
              visible={showInfo}
              animationType="fade"
              onRequestClose={() => setShowInfo(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Price unavailable</Text>
                  <Text style={styles.modalBody}>
                    We're unable to get the price for this product right now — or we were unable to detect a product.
                  </Text>
                  <Pressable style={styles.modalButton} onPress={() => setShowInfo(false)}>
                    <Text style={styles.modalButtonText}>Got it</Text>
                  </Pressable>
                </View>
              </View>
            </Modal>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  topContent: {
    paddingTop: 10,
    paddingHorizontal: 15,
    backgroundColor: "#000",
  },
  helloText: { fontSize: 20, color: "#fff", marginBottom: 2 },
  boldText: { fontWeight: "bold" },
  recentText: { fontSize: 14, color: "#ff2d55", fontWeight: "600", marginBottom: 10 },
  scrollArea: { paddingHorizontal: 15, paddingBottom: 100 },
  gridItem: {
    backgroundColor: "#222",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    width: "48%",
    minHeight: 260,
  },
  itemImage: {
    width: "100%",
    height: 170,
    borderRadius: 8,
    marginBottom: 8,
  },
  itemTitle: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
    height: 16,
  },
  itemPrice: { color: "#ff4757", fontSize: 12 },
  priceUnavailableRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    flexWrap: "nowrap",
  },
  priceUnavailable: {
    color: "#999",
    fontSize: 12,
    marginRight: 4,
    flexShrink: 1,
  },
  siteRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  siteIcon: {
    width: 14,
    height: 14,
    borderRadius: 2,
    marginRight: 5,
  },
  itemSource: {
    color: "#aaa",
    fontSize: 10,
  },
  linkBar: {
    flexDirection: "row",
    backgroundColor: "#222",
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 15,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    color: "#fff",
    paddingHorizontal: 10,
  },
  saveButton: {
    backgroundColor: "#f00",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#111",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  modalBody: {
    fontSize: 14,
    color: "#ccc",
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#333",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
