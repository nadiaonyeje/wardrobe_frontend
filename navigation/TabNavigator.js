import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, StyleSheet } from "react-native";
import HomeScreen from "../screens/HomeScreen";
import Ionicons from "react-native-vector-icons/Ionicons";
import BrowserScreen from "../screens/BrowserScreen";
import WardrobeScreen from "../screens/WardrobeScreen"; // instead of dummy

// Dummy screens
function CanvasScreen() {
  return <View style={styles.center}><Text style={styles.text}>Canvas Screen</Text></View>;
}
function OutfitsScreen() {
  return <View style={styles.center}><Text style={styles.text}>Outfits Screen</Text></View>;
}

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
   <Tab.Navigator
  screenOptions={({ route }) => ({
    headerShown: true, // enables top bar
    headerStyle: {
      backgroundColor: "#000",
      borderBottomColor: "#222",
      borderBottomWidth: 1,
    },
    headerTitleStyle: {
      color: "#fff",
      fontWeight: "600",
    },
    tabBarStyle: { backgroundColor: "#000" },
    tabBarActiveTintColor: "#ff4757",
    tabBarInactiveTintColor: "#fff",
    tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
    tabBarIcon: ({ color, size }) => {
      let iconName;
      if (route.name === "Home") iconName = "home";
      else if (route.name === "Wardrobe") iconName = "albums";
      else if (route.name === "Canvas") iconName = "color-palette";
      else if (route.name === "Outfits") iconName = "shirt";
      else if (route.name === "Search") iconName = "search";
      return <Ionicons name={iconName} size={size} color={color} />;
    },
  })}
>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Wardrobe" component={WardrobeScreen} />
      <Tab.Screen name="Canvas" component={CanvasScreen} />
      <Tab.Screen name="Outfits" component={OutfitsScreen} />
      <Tab.Screen name="Search" component={BrowserScreen}/>
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" },
  text: { color: "#fff", fontSize: 18 },
});
