import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  deleteItem,
  getItemById,
  getItems,
  subscribeItems,
  updateItem,
  updateStock,
} from "../data/items";

export default function ItemDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const currentId = params.id ? parseInt(params.id, 10) : 1;

  // Reactively track items list from store
  const [allItems, setAllItems] = useState(getItems());

  useEffect(() => {
    const unsubscribe = subscribeItems(() => {
      setAllItems(getItems());
    });
    return () => unsubscribe();
  }, []);

  // Find current selected item
  const currentItem = useMemo(() => {
    return allItems.find((item) => item.id === currentId) || allItems[0];
  }, [allItems, currentId]);

  // Find parent item if exists
  const parentItem = useMemo(() => {
    if (!currentItem || currentItem.parentId === null) return null;
    return allItems.find((item) => item.id === currentItem.parentId);
  }, [allItems, currentItem]);

  // Find child items / sub-parts where parentId === currentId
  const childParts = useMemo(() => {
    if (!currentItem) return [];
    return allItems.filter((item) => item.parentId === currentItem.id);
  }, [allItems, currentItem]);

  // Direct numeric input text for stock update (Allows typing 20000, 500, etc. directly!)
  const [stockInputText, setStockInputText] = useState<string>(
    (currentItem?.stock || 0).toString()
  );

  // Sync local counter state when item stock changes externally
  useEffect(() => {
    if (currentItem) {
      setStockInputText(currentItem.stock.toString());
    }
  }, [currentItem?.stock]);

  // Edit Modal State
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editName, setEditName] = useState(currentItem?.name || "");
  const [editCategory, setEditCategory] = useState(currentItem?.category || "");
  const [editStock, setEditStock] = useState(currentItem?.stock?.toString() || "0");
  const [editUnit, setEditUnit] = useState(currentItem?.unit || "PCS");

  // Open edit modal prefilled with current item values
  const handleOpenEditModal = () => {
    if (!currentItem) return;
    setEditName(currentItem.name);
    setEditCategory(currentItem.category);
    setEditStock(currentItem.stock.toString());
    setEditUnit(currentItem.unit);
    setIsEditModalVisible(true);
  };

  // Save edited details
  const handleSaveEdit = () => {
    if (!editName.trim()) {
      Alert.alert("Error", "Please enter a valid product name");
      return;
    }
    const numStock = parseInt(editStock, 10);
    if (isNaN(numStock) || numStock < 0) {
      Alert.alert("Error", "Please enter a valid stock number");
      return;
    }

    updateItem(currentItem.id, {
      name: editName.trim(),
      category: editCategory.trim() || "General",
      stock: numStock,
      unit: editUnit.trim() || "PCS",
    });

    setIsEditModalVisible(false);
    Alert.alert("Success", "Product details updated successfully! ✅");
  };

  // Stock Input handlers
  const handleStockInputChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    setStockInputText(cleaned);
  };

  const handleDecreaseStock = (amount: number = 1) => {
    const current = parseInt(stockInputText, 10) || 0;
    const nextVal = Math.max(0, current - amount);
    setStockInputText(nextVal.toString());
  };

  const handleIncreaseStock = (amount: number = 1) => {
    const current = parseInt(stockInputText, 10) || 0;
    const nextVal = current + amount;
    setStockInputText(nextVal.toString());
  };

  const handleApplyStockUpdate = () => {
    if (!currentItem) return;
    const numStock = parseInt(stockInputText, 10);
    if (isNaN(numStock) || numStock < 0) {
      Alert.alert("Error", "Please enter a valid stock quantity");
      return;
    }
    updateStock(currentItem.id, numStock);
    Alert.alert(
      "Stock Updated! ✅",
      `${currentItem.name} stock updated to ${numStock} ${currentItem.unit}`
    );
  };

  // Delete item handler
  const handleDeleteItem = () => {
    if (!currentItem) return;
    Alert.alert(
      "Delete Item",
      `Are you sure you want to delete "${currentItem.name}"? This will also remove any sub-parts associated with it.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteItem(currentItem.id);
            router.back();
          },
        },
      ]
    );
  };

  if (!currentItem) return null;

  // Status calculation
  const getStatus = (stockVal: number) => {
    if (stockVal === 0) {
      return { text: "Out of Stock", color: "#E53935", bg: "#FFEBEE" };
    }
    if (stockVal <= 10) {
      return { text: "Low Stock", color: "#EF6C00", bg: "#FFF3E0" };
    }
    return { text: "In Stock", color: "#2E7D32", bg: "#E8F5E9" };
  };

  const status = getStatus(currentItem.stock);

  // Level Title Helper
  const getLevelLabel = () => {
    if (currentItem.parentId === null) return "Main Product";
    if (parentItem?.parentId === null) return "Part";
    return "Sub Part";
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {currentItem.name}
          </Text>
          <Text style={styles.headerSubtitle}>
            {getLevelLabel()} {parentItem ? `• Part of ${parentItem.name}` : ""}
          </Text>
        </View>

        {/* Edit Button in Header */}
        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={handleOpenEditModal}
        >
          <Ionicons name="create-outline" size={22} color="#0A4DFF" />
        </TouchableOpacity>

        {/* Delete Button in Header */}
        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={handleDeleteItem}
        >
          <Ionicons name="trash-outline" size={22} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Main Product Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoTopRow}>
            <View style={styles.iconBox}>
              <MaterialCommunityIcons
                name={(currentItem.icon as any) || "cube-outline"}
                size={28}
                color="#0A4DFF"
              />
            </View>

            <View style={styles.infoTitleBox}>
              <Text style={styles.itemName}>{currentItem.name}</Text>
              <Text style={styles.categoryBadge}>{currentItem.category}</Text>
            </View>

            <TouchableOpacity
              style={styles.editCardBtn}
              onPress={handleOpenEditModal}
            >
              <Ionicons name="pencil" size={16} color="#0A4DFF" />
              <Text style={styles.editCardBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoDetailsRow}>
            <View>
              <Text style={styles.label}>Current Stock</Text>
              <Text style={styles.stockValue}>
                {currentItem.stock}{" "}
                <Text style={styles.unitText}>{currentItem.unit}</Text>
              </Text>
            </View>

            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
              <Text style={[styles.statusText, { color: status.color }]}>
                {status.text}
              </Text>
            </View>
          </View>
        </View>

        {/* STOCK EDITING SECTION (Supports Direct Manual Typing & Quick Add Buttons) */}
        <View style={styles.stockUpdateSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Stock Modifier</Text>
          </View>

          <View style={styles.stockControlCard}>
            <Text style={styles.stockControlLabel}>
              Tap number to type manually (e.g. 20000) or use buttons
            </Text>

            <View style={styles.counterRow}>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => handleDecreaseStock(1)}
              >
                <Ionicons name="remove" size={26} color="#0F172A" />
              </TouchableOpacity>

              <View style={styles.counterDisplay}>
                <TextInput
                  style={styles.counterInput}
                  value={stockInputText}
                  onChangeText={handleStockInputChange}
                  keyboardType="numeric"
                  selectTextOnFocus
                  placeholder="0"
                  placeholderTextColor="#94A3B8"
                />
                <Text style={styles.counterUnit}>{currentItem.unit}</Text>
              </View>

              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => handleIncreaseStock(1)}
              >
                <Ionicons name="add" size={26} color="#0F172A" />
              </TouchableOpacity>
            </View>

            {/* Quick Add Presets (+10, +50, +100, +500) */}
            <View style={styles.quickAddRow}>
              <Text style={styles.quickAddLabel}>Quick Add:</Text>
              {[10, 50, 100, 500].map((step) => (
                <TouchableOpacity
                  key={step}
                  style={styles.quickAddBtn}
                  onPress={() => handleIncreaseStock(step)}
                >
                  <Text style={styles.quickAddBtnText}>+{step}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.updateButton}
              onPress={handleApplyStockUpdate}
            >
              <Ionicons name="checkmark-circle" size={20} color="#FFF" />
              <Text style={styles.updateButtonText}>UPDATE STOCK</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* PARTS SECTION (If child parts exist or adding sub-parts) */}
        <View style={styles.partsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {currentItem.parentId === null ? "Parts" : "Sub Parts"} (
              {childParts.length})
            </Text>

            {/* Button to Add Sub-part directly under this product */}
            <TouchableOpacity
              style={styles.addPartBtn}
              onPress={() => {
                router.push({
                  pathname: "/add-product",
                  params: { parentId: currentItem.id.toString() },
                });
              }}
            >
              <Ionicons name="add-circle" size={18} color="#0A4DFF" />
              <Text style={styles.addPartBtnText}>Add Sub Part</Text>
            </TouchableOpacity>
          </View>

          {childParts.length > 0 ? (
            childParts.map((part) => {
              const subPartCount = allItems.filter(
                (i) => i.parentId === part.id
              ).length;

              return (
                <TouchableOpacity
                  key={part.id}
                  activeOpacity={0.8}
                  style={styles.partCard}
                  onPress={() => {
                    router.push({
                      pathname: "/item-detail",
                      params: { id: part.id.toString() },
                    });
                  }}
                >
                  <View style={styles.partIconBox}>
                    <Ionicons name="cog" size={22} color="#0A4DFF" />
                  </View>

                  <View style={styles.partInfo}>
                    <Text style={styles.partName}>{part.name}</Text>
                    <Text style={styles.partStock}>
                      Stock: {part.stock} {part.unit}
                    </Text>
                  </View>

                  {subPartCount > 0 && (
                    <View style={styles.subPartsCountBadge}>
                      <Text style={styles.subPartsCountText}>
                        {subPartCount} Sub Parts
                      </Text>
                    </View>
                  )}

                  <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.noPartsCard}>
              <Text style={styles.noPartsText}>
                No sub-parts added for this item yet.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* EDIT ITEM MODAL */}
      <Modal
        visible={isEditModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Item Details</Text>
              <TouchableOpacity
                onPress={() => setIsEditModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Product / Part Name</Text>
              <TextInput
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter name"
                placeholderTextColor="#94A3B8"
              />

              <Text style={styles.inputLabel}>Category</Text>
              <TextInput
                style={styles.input}
                value={editCategory}
                onChangeText={setEditCategory}
                placeholder="e.g. Appliance, Part, Wire"
                placeholderTextColor="#94A3B8"
              />

              <View style={styles.rowInputs}>
                <View style={styles.flexInput}>
                  <Text style={styles.inputLabel}>Stock Quantity</Text>
                  <TextInput
                    style={styles.input}
                    value={editStock}
                    onChangeText={setEditStock}
                    keyboardType="numeric"
                    placeholder="e.g. 15"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                <View style={[styles.flexInput, { marginLeft: 12 }]}>
                  <Text style={styles.inputLabel}>Unit</Text>
                  <TextInput
                    style={styles.input}
                    value={editUnit}
                    onChangeText={setEditUnit}
                    placeholder="e.g. PCS, Meter, Litre"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.saveModalBtn}
                onPress={handleSaveEdit}
              >
                <Text style={styles.saveModalBtnText}>SAVE CHANGES</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
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

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitleContainer: {
    marginLeft: 12,
    flex: 1,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },

  headerSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
    fontWeight: "500",
  },

  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },

  infoTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  infoTitleBox: {
    flex: 1,
  },

  itemName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },

  categoryBadge: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0A4DFF",
    marginTop: 4,
  },

  editCardBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },

  editCardBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0A4DFF",
    marginLeft: 4,
  },

  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 16,
  },

  infoDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  label: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
    textTransform: "uppercase",
  },

  stockValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 4,
  },

  unitText: {
    fontSize: 15,
    color: "#0A4DFF",
    fontWeight: "700",
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 13,
    fontWeight: "700",
  },

  stockUpdateSection: {
    marginTop: 20,
  },

  stockControlCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },

  stockControlLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 16,
    textAlign: "center",
  },

  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  counterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },

  counterDisplay: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#0A4DFF",
    minWidth: 130,
  },

  counterInput: {
    fontSize: 28,
    fontWeight: "900",
    color: "#0F172A",
    textAlign: "center",
    padding: 0,
    minWidth: 70,
  },

  counterUnit: {
    fontSize: 13,
    color: "#0A4DFF",
    fontWeight: "700",
    marginTop: 2,
  },

  quickAddRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    flexWrap: "wrap",
  },

  quickAddLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    marginRight: 6,
  },

  quickAddBtn: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },

  quickAddBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0A4DFF",
  },

  updateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0A4DFF",
    width: "100%",
    paddingVertical: 15,
    borderRadius: 14,
    elevation: 4,
    shadowColor: "#0A4DFF",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },

  updateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    marginLeft: 8,
    letterSpacing: 0.5,
  },

  partsSection: {
    marginTop: 24,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },

  addPartBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },

  addPartBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0A4DFF",
    marginLeft: 4,
  },

  partCard: {
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

  partIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  partInfo: {
    flex: 1,
  },

  partName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
  },

  partStock: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
    fontWeight: "500",
  },

  subPartsCountBadge: {
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#DCFCE7",
  },

  subPartsCountText: {
    fontSize: 11,
    color: "#15803D",
    fontWeight: "600",
  },

  noPartsCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  noPartsText: {
    color: "#64748B",
    fontSize: 14,
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
    maxHeight: "85%",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
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

  rowInputs: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  flexInput: {
    flex: 1,
  },

  saveModalBtn: {
    backgroundColor: "#0A4DFF",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
  },

  saveModalBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});