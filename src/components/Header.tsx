import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { getShopProfile, subscribeProfile } from "../data/profile";

type HeaderProps = {
  title?: string;
  subtitle?: string;
  onMenuPress?: () => void;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
};

export default function Header({
  title = "Chhabra Electricals",
  subtitle = "Hardware & Inventory Management",
  onMenuPress,
  onNotificationPress,
  onProfilePress,
}: HeaderProps) {
  const [profile, setProfile] = useState(getShopProfile());

  useEffect(() => {
    const unsubscribe = subscribeProfile(() => {
      setProfile(getShopProfile());
    });
    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaView edges={["top"]} style={{ backgroundColor: "#FFFFFF" }}>
      <View style={styles.container}>
      {/* Menu & Business Title */}
      <View style={styles.leftSection}>
        <TouchableOpacity style={styles.iconButton} onPress={onMenuPress}>
          <Ionicons name="menu-outline" size={26} color="#1E293B" />
        </TouchableOpacity>
        <View style={styles.titleWrapper}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
      </View>

      {/* Right Icons: Notification & Profile */}
      <View style={styles.rightSection}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onNotificationPress}
        >
          <Ionicons name="notifications-outline" size={22} color="#1E293B" />
          <View style={styles.notificationDot} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.profileButton} onPress={onProfilePress}>
          {profile.avatarUri ? (
            <Image
              source={{ uri: profile.avatarUri }}
              style={styles.avatarImage}
            />
          ) : (
            <MaterialCommunityIcons name="account" size={20} color="#0A4DFF" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  titleWrapper: {
    marginLeft: 10,
    flex: 1,
  },

  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.3,
  },

  subtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 1,
    fontWeight: "500",
  },

  rightSection: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
    position: "relative",
  },

  notificationDot: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#EF4444",
  },

  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    borderWidth: 1,
    borderColor: "#DBEAFE",
    overflow: "hidden",
  },

  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
});