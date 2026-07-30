import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { APP_CONFIG } from "../config/appConfig";
import {
  getLicenseState,
  subscribeLicense,
  unlockAppWithKey,
} from "../services/licenseService";

export default function AppLockModal() {
  const [license, setLicense] = useState(getLicenseState());
  const [inputKey, setInputKey] = useState("");
  const [showAdminKeyInput, setShowAdminKeyInput] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeLicense(() => {
      setLicense(getLicenseState());
    });
    return () => unsubscribe();
  }, []);

  const handleUnlock = () => {
    if (!inputKey.trim()) {
      Alert.alert("Required ⚠️", "Please enter the Admin License Key.");
      return;
    }

    const success = unlockAppWithKey(inputKey);
    if (success) {
      Alert.alert("Success! 🔓", "App unlocked successfully! Full access granted.");
      setInputKey("");
      setShowAdminKeyInput(false);
    } else {
      Alert.alert(
        "Invalid Master Key ❌",
        `The license key you entered is incorrect. Please contact Admin ${APP_CONFIG.adminName}.`
      );
    }
  };

  const handleCallAdmin = () => {
    Linking.openURL(`tel:${APP_CONFIG.adminPhone.replace(/\s+/g, "")}`);
  };

  if (!license.isLocked) return null;

  return (
    <Modal visible={license.isLocked} transparent animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.card}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ alignItems: "center" }}
          >
            <View style={styles.lockIconCircle}>
              <Ionicons name="lock-closed" size={44} color="#DC2626" />
            </View>

            <Text style={styles.title}>Access Suspended</Text>
            <Text style={styles.subtitle}>
              {license.lockReason || "Subscription Payment Pending."}
            </Text>

            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color="#D97706" />
              <Text style={styles.infoBoxText}>
                To reactivate app access or renew subscription, please contact the System
                Admin:
              </Text>
            </View>

            <View style={styles.adminContactBox}>
              <Text style={styles.adminName}>{APP_CONFIG.adminName}</Text>
              <Text style={styles.adminPhone}>{APP_CONFIG.adminPhone}</Text>
            </View>

            {/* Call Admin Button */}
            <TouchableOpacity style={styles.callBtn} onPress={handleCallAdmin}>
              <Ionicons name="call" size={20} color="#FFFFFF" />
              <Text style={styles.callBtnText}>CALL ADMIN TO RENEW</Text>
            </TouchableOpacity>

            {/* Admin Key Input Section (Controllable remotely via allowKeyUnlock) */}
            {license.allowKeyUnlock !== false && (
              <View style={styles.keyInputSection}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#475569", marginBottom: 6, textAlign: "center" }}>
                  🔑 Enter Admin Security Key:
                </Text>
                <TextInput
                  style={styles.keyInput}
                  placeholder="Enter Key (e.g. 6401-RAJ)"
                  placeholderTextColor="#94A3B8"
                  value={inputKey}
                  onChangeText={setInputKey}
                  autoCapitalize="characters"
                />

                <TouchableOpacity style={styles.unlockBtn} onPress={handleUnlock}>
                  <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                  <Text style={styles.unlockBtnText}>UNLOCK APP ACCESS</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.92)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    width: "100%",
    maxWidth: 400,
    maxHeight: "88%",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },

  lockIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },

  title: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 4,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
    lineHeight: 18,
  },

  infoBox: {
    flexDirection: "row",
    backgroundColor: "#FFFBEB",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FDE68A",
    marginBottom: 14,
    alignItems: "center",
    width: "100%",
  },

  infoBoxText: {
    fontSize: 12,
    color: "#92400E",
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
    fontWeight: "500",
  },

  adminContactBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  adminName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 2,
  },

  adminPhone: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0A4DFF",
  },

  callBtn: {
    flexDirection: "row",
    backgroundColor: "#16A34A",
    width: "100%",
    paddingVertical: 13,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    marginBottom: 12,
  },

  callBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
    marginLeft: 8,
    letterSpacing: 0.5,
  },

  toggleAdminBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 4,
  },

  toggleAdminBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0A4DFF",
    marginLeft: 6,
  },

  keyInputSection: {
    width: "100%",
    marginTop: 8,
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  keyInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: "#0F172A",
    marginBottom: 10,
    textAlign: "center",
    fontWeight: "700",
  },

  unlockBtn: {
    flexDirection: "row",
    backgroundColor: "#0A4DFF",
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  unlockBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
    marginLeft: 6,
  },
});
