import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  getShopProfile,
  subscribeProfile,
  updateShopProfile,
} from "../data/profile";
import {
  getLicenseState,
  getUnpredictableMonthlyPasscode,
  setRemoteLockStatus,
  subscribeLicense,
  unlockAppWithKey,
} from "../services/licenseService";
import {
  exportFullBackupJson,
  restoreFromBackupJson,
  restoreFromCloud,
} from "../services/syncService";

export default function ProfileScreen() {
  const [profile, setProfile] = useState(getShopProfile());
  const [license, setLicense] = useState(getLicenseState());

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImagePickerModalOpen, setIsImagePickerModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Edit form states
  const [shopName, setShopName] = useState(profile.shopName);
  const [ownerName, setOwnerName] = useState(profile.ownerName);
  const [phone, setPhone] = useState(profile.phone);
  const [email, setEmail] = useState(profile.email);
  const [address, setAddress] = useState(profile.address);
  const [gstNo, setGstNo] = useState(profile.gstNo);
  const [businessType, setBusinessType] = useState(profile.businessType);

  // Export Backup state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportJsonText, setExportJsonText] = useState("");

  // Restore input state
  const [restoreJsonInput, setRestoreJsonInput] = useState("");

  // Admin key state
  const [adminKey, setAdminKey] = useState("");

  useEffect(() => {
    const unsubProfile = subscribeProfile(() => {
      const p = getShopProfile();
      setProfile(p);
      setShopName(p.shopName);
      setOwnerName(p.ownerName);
      setPhone(p.phone);
      setEmail(p.email);
      setAddress(p.address);
      setGstNo(p.gstNo);
      setBusinessType(p.businessType);
    });

    const unsubLicense = subscribeLicense(() => {
      setLicense(getLicenseState());
    });

    return () => {
      unsubProfile();
      unsubLicense();
    };
  }, []);

  // Image Picker: Pick from Gallery
  const handlePickFromGallery = async () => {
    setIsImagePickerModalOpen(false);
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission Denied",
        "Gallery access permission is required to select a profile photo."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedUri = result.assets[0].uri;
      updateShopProfile({ avatarUri: selectedUri });
      Alert.alert("Success! 📸", "Profile photo updated from Gallery!");
    }
  };

  // Image Picker: Take Photo with Camera
  const handleTakePhoto = async () => {
    setIsImagePickerModalOpen(false);
    const permissionResult =
      await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission Denied",
        "Camera permission is required to take a profile photo."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const capturedUri = result.assets[0].uri;
      updateShopProfile({ avatarUri: capturedUri });
      Alert.alert("Success! 📸", "New profile photo captured and saved!");
    }
  };

  const handleSaveProfile = () => {
    if (!shopName.trim()) {
      Alert.alert("Required", "Please enter shop name");
      return;
    }

    updateShopProfile({
      shopName: shopName.trim(),
      ownerName: ownerName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      gstNo: gstNo.trim(),
      businessType: businessType.trim(),
    });

    setIsEditModalOpen(false);
    Alert.alert("Success! ✅", "Shop profile updated successfully!");
  };

  // Export Data Backup
  const handleExportBackup = () => {
    const jsonStr = exportFullBackupJson();
    setExportJsonText(jsonStr);
    setIsExportModalOpen(true);
  };

  const handleShareBackup = async () => {
    try {
      await Share.share({
        message: exportJsonText,
        title: "Chhabra Inventory Backup Code",
      });
    } catch (e) {
      console.error("Share error", e);
    }
  };

  const [isFetchingCloud, setIsFetchingCloud] = useState(false);

  // Restore directly from Cloud Server
  const handleCloudRestore = async () => {
    setIsFetchingCloud(true);
    const res = await restoreFromCloud();
    setIsFetchingCloud(false);
    if (res.success) {
      setIsRestoreModalOpen(false);
      Alert.alert("Cloud Restore Success! ☁️", res.message);
    } else {
      Alert.alert("Cloud Restore Error ❌", res.message);
    }
  };

  // Restore Data Backup
  const handlePerformRestore = async () => {
    if (!restoreJsonInput.trim()) {
      Alert.alert("Error", "Please paste your backup JSON code.");
      return;
    }

    const res = await restoreFromBackupJson(restoreJsonInput.trim());
    if (res.success) {
      setIsRestoreModalOpen(false);
      setRestoreJsonInput("");
      Alert.alert("Restored! 🎉", res.message);
    } else {
      Alert.alert("Restore Failed ❌", res.message);
    }
  };

  // Admin Lock Toggle
  const handleAdminLockToggle = () => {
    if (!adminKey.trim()) {
      Alert.alert("Error", "Please enter Admin Master Key");
      return;
    }

    if (unlockAppWithKey(adminKey)) {
      setRemoteLockStatus(
        !license.isLocked,
        "Access Suspended by Admin due to Pending Subscription Payment."
      );
      setAdminKey("");
      setIsAdminModalOpen(false);
      Alert.alert(
        "Admin Action Done",
        `App status updated to: ${!license.isLocked ? "LOCKED 🔒" : "ACTIVE 🔓"}`
      );
    } else {
      Alert.alert("Invalid Key", "Master Key is incorrect.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shop & Owner Profile</Text>
        <TouchableOpacity
          style={styles.editHeaderBtn}
          onPress={() => setIsEditModalOpen(true)}
        >
          <Ionicons name="create-outline" size={22} color="#0A4DFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Top Profile Card Banner */}
        <View style={styles.bannerCard}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.avatarWrapper}
            onPress={() => setIsImagePickerModalOpen(true)}
          >
            {profile.avatarUri ? (
              <Image
                source={{ uri: profile.avatarUri }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatarCircle}>
                <MaterialCommunityIcons name="store" size={40} color="#0A4DFF" />
              </View>
            )}
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={14} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <Text style={styles.changePhotoText}>Tap photo to change</Text>
          <Text style={styles.shopTitle}>{profile.shopName}</Text>
          <Text style={styles.ownerSubtitle}>Owner: {profile.ownerName}</Text>

          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{profile.businessType}</Text>
          </View>
        </View>

        {/* Detailed Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionHeader}>Contact & Location</Text>

          {/* Mobile Phone */}
          <View style={styles.infoRowCard}>
            <View style={[styles.infoIconBox, { backgroundColor: "#EFF6FF" }]}>
              <Ionicons name="call" size={22} color="#0A4DFF" />
            </View>
            <View style={styles.infoTextBox}>
              <Text style={styles.infoLabel}>Mobile / Phone Number</Text>
              <Text style={styles.infoValue}>{profile.phone}</Text>
            </View>
          </View>

          {/* Email Address */}
          <View style={styles.infoRowCard}>
            <View style={[styles.infoIconBox, { backgroundColor: "#F0FDF4" }]}>
              <Ionicons name="mail" size={22} color="#16A34A" />
            </View>
            <View style={styles.infoTextBox}>
              <Text style={styles.infoLabel}>Email Address</Text>
              <Text style={styles.infoValue}>{profile.email}</Text>
            </View>
          </View>

          {/* Shop Address */}
          <View style={styles.infoRowCard}>
            <View style={[styles.infoIconBox, { backgroundColor: "#FFF7ED" }]}>
              <Ionicons name="location" size={22} color="#EA580C" />
            </View>
            <View style={styles.infoTextBox}>
              <Text style={styles.infoLabel}>Shop Address</Text>
              <Text style={styles.infoValue}>{profile.address}</Text>
            </View>
          </View>

          {/* GST / Business License */}
          <View style={styles.infoRowCard}>
            <View style={[styles.infoIconBox, { backgroundColor: "#F5F3FF" }]}>
              <Ionicons name="document-text" size={22} color="#7C3AED" />
            </View>
            <View style={styles.infoTextBox}>
              <Text style={styles.infoLabel}>GST / Trade License No.</Text>
              <Text style={styles.infoValue}>{profile.gstNo}</Text>
            </View>
          </View>
        </View>

        {/* DATA BACKUP & RESTORE SECTION */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionHeader}>Data Safety & Recovery</Text>

          <TouchableOpacity
            style={styles.actionCardBtn}
            onPress={handleExportBackup}
          >
            <Ionicons name="cloud-upload" size={22} color="#0A4DFF" />
            <View style={styles.actionCardTextWrapper}>
              <Text style={styles.actionCardTitle}>Export Cloud Backup</Text>
              <Text style={styles.actionCardSub}>
                Generate snapshot of all products & stock
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCardBtn}
            onPress={() => setIsRestoreModalOpen(true)}
          >
            <Ionicons name="cloud-download" size={22} color="#16A34A" />
            <View style={styles.actionCardTextWrapper}>
              <Text style={styles.actionCardTitle}>Restore Data Backup</Text>
              <Text style={styles.actionCardSub}>
                Restore 100% products & stock if phone is lost
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Edit Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.editBtn}
          onPress={() => setIsEditModalOpen(true)}
        >
          <Ionicons name="pencil" size={20} color="#FFF" />
          <Text style={styles.editBtnText}>EDIT SHOP INFORMATION</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* RESTORE BACKUP MODAL */}
      <Modal
        visible={isRestoreModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsRestoreModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Restore Inventory Backup</Text>
              <TouchableOpacity
                onPress={() => setIsRestoreModalOpen(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {/* 1-Click Cloud Restore Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.saveModalBtn,
                  { backgroundColor: "#0A4DFF", flexDirection: "row", marginBottom: 16 },
                ]}
                onPress={handleCloudRestore}
                disabled={isFetchingCloud}
              >
                <Ionicons name="cloud-download-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.saveModalBtnText}>
                  {isFetchingCloud ? "DOWNLOADING CLOUD BACKUP..." : "FETCH & RESTORE FROM CLOUD"}
                </Text>
              </TouchableOpacity>

              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
                <View style={{ flex: 1, height: 1, backgroundColor: "#E2E8F0" }} />
                <Text style={{ marginHorizontal: 8, fontSize: 12, color: "#94A3B8", fontWeight: "700" }}>
                  OR PASTE CODE MANUALLY
                </Text>
                <View style={{ flex: 1, height: 1, backgroundColor: "#E2E8F0" }} />
              </View>

              <Text style={styles.inputLabel}>Paste Backup JSON String:</Text>
              <TextInput
                style={[styles.input, { height: 90, textAlignVertical: "top", fontFamily: "monospace", fontSize: 12 }]}
                value={restoreJsonInput}
                onChangeText={setRestoreJsonInput}
                multiline
                placeholder="Paste your JSON backup code here..."
                placeholderTextColor="#94A3B8"
              />

              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.saveModalBtn, { backgroundColor: "#16A34A", marginTop: 10 }]}
                onPress={handlePerformRestore}
              >
                <Text style={styles.saveModalBtnText}>RESTORE FROM PASTED CODE</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* IMAGE PICKER SELECTION MODAL */}
      <Modal
        visible={isImagePickerModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsImagePickerModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Profile Photo</Text>
              <TouchableOpacity
                onPress={() => setIsImagePickerModalOpen(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.pickerOptionBtn}
              onPress={handlePickFromGallery}
            >
              <View style={[styles.pickerIconBox, { backgroundColor: "#EFF6FF" }]}>
                <Ionicons name="images" size={24} color="#0A4DFF" />
              </View>
              <View>
                <Text style={styles.pickerOptionTitle}>Choose from Gallery</Text>
                <Text style={styles.pickerOptionSub}>Select an existing photo</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.pickerOptionBtn}
              onPress={handleTakePhoto}
            >
              <View style={[styles.pickerIconBox, { backgroundColor: "#F0FDF4" }]}>
                <Ionicons name="camera" size={24} color="#16A34A" />
              </View>
              <View>
                <Text style={styles.pickerOptionTitle}>Take a New Photo</Text>
                <Text style={styles.pickerOptionSub}>Capture with your camera</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* EDIT PROFILE MODAL */}
      <Modal
        visible={isEditModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsEditModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Shop Information</Text>
              <TouchableOpacity
                onPress={() => setIsEditModalOpen(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={styles.inputLabel}>Shop Name</Text>
              <TextInput
                style={styles.input}
                value={shopName}
                onChangeText={setShopName}
                placeholder="e.g. Chhabra Electricals"
                placeholderTextColor="#94A3B8"
              />

              <Text style={styles.inputLabel}>Owner Name</Text>
              <TextInput
                style={styles.input}
                value={ownerName}
                onChangeText={setOwnerName}
                placeholder="e.g. Deepak Raj"
                placeholderTextColor="#94A3B8"
              />

              <Text style={styles.inputLabel}>Mobile / Phone Number</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="+91 82877 75175"
                placeholderTextColor="#94A3B8"
              />

              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                placeholder="contact@shop.com"
                placeholderTextColor="#94A3B8"
              />

              <Text style={styles.inputLabel}>Shop Address</Text>
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: "top" }]}
                value={address}
                onChangeText={setAddress}
                multiline
                placeholder="Full shop address..."
                placeholderTextColor="#94A3B8"
              />

              <Text style={styles.inputLabel}>GST / License No.</Text>
              <TextInput
                style={styles.input}
                value={gstNo}
                onChangeText={setGstNo}
                placeholder="e.g. 07AAAAA0000A1Z5"
                placeholderTextColor="#94A3B8"
              />

              <Text style={styles.inputLabel}>Business Category</Text>
              <TextInput
                style={styles.input}
                value={businessType}
                onChangeText={setBusinessType}
                placeholder="e.g. Electricals & Home Appliances"
                placeholderTextColor="#94A3B8"
              />

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.saveModalBtn}
                onPress={handleSaveProfile}
              >
                <Text style={styles.saveModalBtnText}>SAVE PROFILE</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* EXPORT BACKUP MODAL */}
      <Modal
        visible={isExportModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsExportModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cloud Inventory Backup 📦</Text>
              <TouchableOpacity
                onPress={() => setIsExportModalOpen(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 13, color: "#475569", marginBottom: 10, lineHeight: 18 }}>
              Your full inventory & shop profile backup code is ready! Tap <Text style={{ fontWeight: "700", color: "#16A34A" }}>SHARE BACKUP CODE</Text> to send it to WhatsApp / Email for safe keeping.
            </Text>

            <ScrollView
              style={{
                maxHeight: 180,
                backgroundColor: "#0F172A",
                padding: 12,
                borderRadius: 10,
                marginBottom: 16,
              }}
            >
              <Text style={{ fontFamily: "monospace", fontSize: 11, color: "#38BDF8" }}>
                {exportJsonText}
              </Text>
            </ScrollView>

            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.saveModalBtn, { backgroundColor: "#16A34A", flexDirection: "row" }]}
              onPress={handleShareBackup}
            >
              <Ionicons name="share-social-outline" size={18} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.saveModalBtnText}>SHARE BACKUP CODE (WhatsApp / Email)</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    flex: 1,
  },

  editHeaderBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },

  scrollContent: {
    padding: 16,
  },

  bannerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },

  avatarWrapper: {
    position: "relative",
    marginBottom: 8,
  },

  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: "#0A4DFF",
  },

  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#DBEAFE",
  },

  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#0A4DFF",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  changePhotoText: {
    fontSize: 12,
    color: "#0A4DFF",
    fontWeight: "700",
    marginBottom: 12,
  },

  shopTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0F172A",
    textAlign: "center",
  },

  ownerSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
    fontWeight: "600",
  },

  categoryBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },

  categoryBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0A4DFF",
  },

  infoSection: {
    marginTop: 24,
  },

  sectionHeader: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
  },

  infoRowCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  infoIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  infoTextBox: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    textTransform: "uppercase",
  },

  infoValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 2,
  },

  actionCardBtn: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 2,
  },

  actionCardTextWrapper: {
    marginLeft: 14,
    flex: 1,
  },

  actionCardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },

  actionCardSub: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },

  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0A4DFF",
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 16,
    marginBottom: 30,
    elevation: 4,
    shadowColor: "#0A4DFF",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },

  editBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginLeft: 8,
    letterSpacing: 0.5,
  },

  // PICKER MODAL STYLES
  pickerOptionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  pickerIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  pickerOptionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },

  pickerOptionSub: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },

  // MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },

  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "88%",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },

  modalCloseBtn: {
    padding: 4,
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 6,
    marginTop: 10,
  },

  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#0F172A",
  },

  saveModalBtn: {
    backgroundColor: "#0A4DFF",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 20,
  },

  saveModalBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
