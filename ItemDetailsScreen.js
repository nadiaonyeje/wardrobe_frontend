 import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
  Share,
  TextInput,
  Modal,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
export default function ItemDetailsScreen({ route }) {
  const { item } = route.params;
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [ownership, setOwnership] = useState("own");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const handleView = () => {
    if (item.source) {
      Linking.openURL(item.source);
    }
  };
  const handleAdd = () => {
    setModalVisible(true);
  };
  const handleSaveToWardrobe = async () => {
    const userId = await AsyncStorage.getItem("user_id");
    if (!userId) {
      Alert.alert("Error", "User ID not found.");
      return;
    }
    try {
      const response = await fetch("https://wardrobe-backend-o0fr.onrender.com/items/assign-category/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_id: item.id,
          ownership,
          category,
          subcategory,
          users_id: userId,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert("Success", "Item added to your wardrobe.");
        setModalVisible(false);
      } else {
        Alert.alert("Error", data.detail || "Failed to save.");
      }
    } catch (err) {
      Alert.alert("Error", "Something went wrong.");
    }
  };
  const handleShare = async () => {
    try {
      await Share.share({
        message: `${item.title}\n${item.source}`,
      });
    } catch (error) {
      Alert.alert("Error", "Unable to share the item.");
    }
  };
  const handleDelete = () => {
    Alert.alert("Delete Item", "Are you sure you want to delete this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await fetch(`https://wardrobe-backend-o0fr.onrender.com/items/${item.id}`, {
              method: "DELETE",
            });
            if (response.ok) {
              Alert.alert("Deleted", "Item removed from your wardrobe.");
              navigation.goBack();
            } else {
              Alert.alert("Error", "Unable to delete item.");
            }
          } catch (err) {
            Alert.alert("Error", "Server issue while deleting item.");
          }
        },
      },
    ]);
  };
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: item.image_url }}
        style={styles.image}
        resizeMode="contain"
      />
      <View style={styles.detailsContainer}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.price}>{item.price || "Price unavailable"}</Text>
        <View style={styles.sourceRow}>
          {item.site_icon_url && (
            <Image source={{ uri: item.site_icon_url }} style={styles.siteIcon} />
          )}
          <Text style={styles.sourceText}>{item.site_name}</Text>
        </View>
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.viewButton} onPress={handleView}>
          <Text style={styles.viewButtonText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={handleAdd}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
          <Ionicons name="share-social-outline" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add to Wardrobe</Text>
            <View style={styles.radioRow}>
              <TouchableOpacity onPress={() => setOwnership("own")}>
                <Text style={ownership === "own" ? styles.radioSelected : styles.radioOption}>
                  ● Own
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setOwnership("wishlist")}>
                <Text style={ownership === "wishlist" ? styles.radioSelected : styles.radioOption}>
                  ● Wishlist
                </Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Category (e.g. Dresses)"
              placeholderTextColor="#aaa"
              value={category}
              onChangeText={setCategory}
            />
            <TextInput
              style={styles.input}
              placeholder="Subcategory (e.g. Maxi Dress)"
              placeholderTextColor="#aaa"
              value={subcategory}
              onChangeText={setSubcategory}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveToWardrobe}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", paddingBottom: 20 },
  image: { flex: 1, width: "100%", marginBottom: 10 },
  detailsContainer: { paddingHorizontal: 20, marginBottom: 10 },
  title: { color: "#fff", fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  price: { color: "#ff4757", fontSize: 14, marginBottom: 4 },
  sourceRow: { flexDirection: "row", alignItems: "center" },
  siteIcon: { width: 14, height: 14, marginRight: 6, borderRadius: 2 },
  sourceText: { color: "#aaa", fontSize: 12 },
  buttonRow: { flexDirection: "row", gap: 10, marginHorizontal: 15 },
  viewButton: {
    flex: 1, backgroundColor: "#1e90ff", paddingVertical: 12,
    borderRadius: 10, alignItems: "center"
  },
  viewButtonText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  iconButton: { backgroundColor: "#333", padding: 12, borderRadius: 10 },
  // Modal
  modalContainer: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", alignItems: "center" },
  modalContent: {
    backgroundColor: "#111", padding: 20, width: "85%", borderRadius: 10, borderWidth: 1, borderColor: "#444",
  },
  modalTitle: { color: "#fff", fontSize: 18, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  input: {
    backgroundColor: "#222", color: "#fff", borderRadius: 6,
    paddingHorizontal: 10, paddingVertical: 8, marginVertical: 8,
  },
  radioRow: { flexDirection: "row", justifyContent: "space-around", marginVertical: 10 },
  radioOption: { color: "#aaa", fontSize: 16 },
  radioSelected: { color: "#ff4757", fontSize: 16, fontWeight: "bold" },
  modalButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 15 },
  saveBtn: { backgroundColor: "#ff4757", padding: 10, borderRadius: 6 },
  cancelBtn: { backgroundColor: "#444", padding: 10, borderRadius: 6 },
  saveText: { color: "#fff", fontWeight: "bold" },
  cancelText: { color: "#fff" },
});