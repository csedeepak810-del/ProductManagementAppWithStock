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
import { addItem, getItemById } from "../data/items";

export default function AddProductScreen() {
  const params = useLocalSearchParams<{ parentId?: string }>();
  const parentIdNum = params.parentId ? parseInt(params.parentId, 10) : null;

  // Get parent item if adding sub-part
  const parentItem = useMemo(() => {
    if (!parentIdNum) return null;
    return getItemById(parentIdNum);
  }, [parentIdNum]);

  const [name, setName] = useState("");
  const [category, setCategory] = useState(
    parentItem ? parentItem.category : "Appliance"
  );
  const [stock, setStock] = useState("");
  const [unit, setUnit] = useState("PCS");

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Required", "Please enter a product or part name.");
      return;
    }
    const stockVal = parseInt(stock, 10);
    if (isNaN(stockVal) || stockVal < 0) {
      Alert.alert("Required", "Please enter a valid stock number.");
      return;
    }

    const newItem = addItem({
      name: name.trim(),
      parentId: parentIdNum,
      category: category.trim() || (parentItem ? "Part" : "Appliance"),
      stock: stockVal,
      unit: unit.trim() || "PCS",
      icon: parentItem ? "cog" : "cube-outline",
    });

    Alert.alert(
      "Success! ✅",
      `"${newItem.name}" added successfully as ${
        parentItem ? `sub-part of ${parentItem.name}` : "main product"
      }.`
    );

    router.back();
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
        <Text style={styles.headerTitle}>
          {parentItem ? `Add Part to ${parentItem.name}` : "Add New Main Product"}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.formContent}
      >
        <View style={styles.formCard}>
          {parentItem && (
            <View style={styles.parentNotice}>
              <Ionicons name="information-circle" size={20} color="#0A4DFF" />
              <Text style={styles.parentNoticeText}>
                This item will be added directly under parent:{" "}
                <Text style={{ fontWeight: "700" }}>{parentItem.name}</Text>
              </Text>
            </View>
          )}

          {/* Product / Part Name */}
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            placeholder={
              parentItem
                ? "e.g. Motor, Armature, Bearing"
                : "e.g. Washing Machine, Refrigerator"
            }
            placeholderTextColor="#94A3B8"
            value={name}
            onChangeText={setName}
          />

          {/* Category */}
          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Appliance, Inverter, Wire, Part"
            placeholderTextColor="#94A3B8"
            value={category}
            onChangeText={setCategory}
          />

          {/* Stock & Unit Row */}
          <View style={styles.row}>
            <View style={styles.flexItem}>
              <Text style={styles.label}>Initial Stock *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 15"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={stock}
                onChangeText={setStock}
              />
            </View>

            <View style={[styles.flexItem, { marginLeft: 12 }]}>
              <Text style={styles.label}>Unit *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. PCS, Meter, Litre"
                placeholderTextColor="#94A3B8"
                value={unit}
                onChangeText={setUnit}
              />
            </View>
          </View>

          {/* Quick Unit Presets */}
          <Text style={styles.presetLabel}>Quick Select Unit:</Text>
          <View style={styles.presetRow}>
            {["PCS", "Meter", "Litre", "Kg", "Set", "Box"].map((u) => (
              <TouchableOpacity
                key={u}
                style={[
                  styles.presetChip,
                  unit === u && styles.presetChipActive,
                ]}
                onPress={() => setUnit(u)}
              >
                <Text
                  style={[
                    styles.presetChipText,
                    unit === u && styles.presetChipTextActive,
                  ]}
                >
                  {u}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.submitBtn}
            onPress={handleSave}
          >
            <Ionicons name="checkmark-circle" size={22} color="#FFF" />
            <Text style={styles.submitBtnText}>SAVE PRODUCT</Text>
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

  parentNotice: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },

  parentNoticeText: {
    fontSize: 13,
    color: "#1D4ED8",
    marginLeft: 8,
    flex: 1,
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

  presetLabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 14,
    marginBottom: 8,
    fontWeight: "600",
  },

  presetRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },

  presetChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },

  presetChipActive: {
    backgroundColor: "#0A4DFF",
    borderColor: "#0A4DFF",
  },

  presetChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },

  presetChipTextActive: {
    color: "#FFFFFF",
  },

  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0A4DFF",
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 12,
    elevation: 4,
    shadowColor: "#0A4DFF",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },

  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    marginLeft: 8,
    letterSpacing: 0.5,
  },
});
