// components/AddToWardrobeModal.js
import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DropDownPicker from "react-native-dropdown-picker";

export default function AddToWardrobeModal({ visible, onClose, item }) {
  const [ownership, setOwnership] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [ownershipOptions, setOwnershipOptions] = useState(["own", "wishlist"]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [subcategoryOptions, setSubcategoryOptions] = useState([]);

  useEffect(() => {
    if (visible) loadPreviousSelections();
  }, [visible]);

  const loadPreviousSelections = async () => {
    try {
      const storedCategories = await AsyncStorage.getItem("categories");
      const storedSubcategories = await AsyncStorage.getItem("subcategories");
      if (storedCategories) setCategoryOptions(JSON.parse(storedCategories));
      if (storedSubcategories) setSubcategoryOptions(JSON.parse(storedSubcategories));
    } catch (e) {
      console.log("Error loading saved options:", e);
    }
  };

  const saveNewSelections = async () => {
    const updateStorage = async (key, value) => {
      const existing = await AsyncStorage.getItem(key);
      let list = existing ? JSON.parse(existing) : [];
      if (!list.includes(value)) {
        list.push(value);
        await AsyncStorage.setItem(key, JSON.stringify(list));
      }
    };

    await updateStorage("categories", category);
    await updateStorage("subcategories", subcategory);
  };

  const handleSave = async () => {
    if (!ownership || !category || !subcategory) {
      Alert.alert("Please fill all fields");
      return;
    }

    const userId = await AsyncStorage.getItem("user_id");
    if (!userId) {
      Alert.alert("Error", "User ID not found.");
      return;
    }

    try {
      const response = await fetch("https://wardrobe-backend-o0fr.onrender.com/items/assign-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_id: item.id,
          ownership,
          category,
          subcategory,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await saveNewSelections();
        Alert.alert("Saved", "Item updated with metadata.");
        onClose();
      } else {
        Alert.alert("Error", data.detail || "Could not update item.");
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Categorize Item</Text>

          <Text style={styles.label}>Ownership</Text>
          <TextInput
            placeholder="Own or Wishlist"
            placeholderTextColor="#888"
            value={ownership}
            onChangeText={setOwnership}
            style={styles.input}
          />

          <Text style={styles.label}>Category</Text>
          <TextInput
            placeholder="e.g. Shoes, Tops"
            placeholderTextColor="#888"
            value={category}
            onChangeText={setCategory}
            style={styles.input}
          />

          <Text style={styles.label}>Subcategory</Text>
          <TextInput
            placeholder="e.g. Heels, T-Shirts"
            placeholderTextColor="#888"
            value={subcategory}
            onChangeText={setSubcategory}
            style={styles.input}
          />

          <View style={styles.row}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#000000aa",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modal: {
    backgroundColor: "#111",
    padding: 20,
    borderRadius: 12,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  label: {
    color: "#ccc",
    marginTop: 10,
    fontSize: 13,
  },
  input: {
    backgroundColor: "#222",
    color: "#fff",
    padding: 10,
    borderRadius: 6,
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  cancelText: {
    color: "#ccc",
  },
  saveBtn: {
    backgroundColor: "#ff4757",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  saveText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
