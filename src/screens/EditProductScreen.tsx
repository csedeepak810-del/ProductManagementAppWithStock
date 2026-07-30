import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getItemById, updateItem } from "../data/items";

export default function EditProductScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const itemId = params.id ? parseInt(params.id, 10) : 1;

  const targetItem = useMemo(() => getItemById(itemId), [itemId]);

  const [name, setName] = useState(targetItem?.name || "");
  const [category, setCategory] = useState(targetItem?.category || "");
  const [stock, setStock] = useState(targetItem?.stock?.toString() || "0");
  const [unit, setUnit] = useState(targetItem?.unit || "PCS");

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Required", "Please enter item name.");
      return;
    }
    const stockVal = parseInt(stock, 10);
    if (isNaN(stockVal) || stockVal < 0) {
      Alert.alert("Required", "Please enter a valid stock number.");
      return;
    }

    if (targetItem) {
      updateItem(targetItem.id, {
        name: name.trim(),
        category: category.trim() || "General",
        stock: stockVal,
        unit: unit.trim() || "PCS",
      });

      Alert.alert("Success! ✅", `"${name.trim()}" updated successfully.`);
      router.back();
    }
  };

  if (!targetItem) return null;

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
        <Text style={styles.headerTitle}>Edit {targetItem.name}</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.formContent}
      >
        <View style={styles.formCard}>
          {/* Product / Part Name */}
          <Text style={styles.label}>Product / Part Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter name"
            placeholderTextColor="#94A3B8"
          />

          {/* Category */}
          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.input}
            value={category}
            onChangeText={setCategory}
            placeholder="Category name"
            placeholderTextColor="#94A3B8"
          />

          {/* Stock & Unit Row */}
          <View style={styles.row}>
            <View style={styles.flexItem}>
              <Text style={styles.label}>Stock Quantity *</Text>
              <TextInput
                style={styles.input}
                value={stock}
                onChangeText={setStock}
                keyboardType="numeric"
                placeholder="Stock quantity"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={[styles.flexItem, { marginLeft: 12 }]}>
              <Text style={styles.label}>Unit *</Text>
              <TextInput
                style={styles.input}
                value={unit}
                onChangeText={setUnit}
                placeholder="e.g. PCS, Meter, Litre"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.submitBtn}
            onPress={handleSave}
          >
            <Ionicons name="checkmark-circle" size={22} color="#FFF" />
            <Text style={styles.submitBtnText}>UPDATE PRODUCT DETAILS</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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

  formContent: {
    padding: 16,
  },

  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },

  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 6,
    marginTop: 12,
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

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  flexItem: {
    flex: 1,
  },

  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0A4DFF",
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 24,
    elevation: 4,
    shadowColor: "#0A4DFF",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },

  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginLeft: 8,
    letterSpacing: 0.5,
  },
});
