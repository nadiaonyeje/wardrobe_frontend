// components/ItemCard.js
import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function ItemCard({ item }) {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("ItemDetails", { item })}
    >
      <Image source={{ uri: item.image_url }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.price}>{item.price || "N/A"}</Text>
        <Text style={styles.site}>{item.site_name}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#111",
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: "row",
    overflow: "hidden",
  },
  image: {
    width: 80,
    height: 80,
    backgroundColor: "#222",
  },
  info: {
    flex: 1,
    padding: 10,
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  price: {
    color: "#ff4757",
    fontSize: 13,
  },
  site: {
    color: "#888",
    fontSize: 11,
    marginTop: 4,
  },
});