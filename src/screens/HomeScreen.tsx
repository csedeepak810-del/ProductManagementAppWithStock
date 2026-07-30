import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CategoryList from "../components/CategoryList";
import DashboardCard from "../components/DashboardCard";
import Header from "../components/Header";
import ItemCard from "../components/ItemCard";
import SearchBar from "../components/SearchBar";
import { getItems, subscribeItems } from "../data/items";
import { getShopProfile, subscribeProfile } from "../data/profile";

export default function HomeScreen() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [stockFilter, setStockFilter] = useState<"All" | "LowStock" | "OutOfStock">("All");

  const [allItems, setAllItems] = useState(getItems());
  const [profile, setProfile] = useState(getShopProfile());
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Subscribe to store updates
  useEffect(() => {
    const unsubItems = subscribeItems(() => {
      setAllItems(getItems());
    });
    const unsubProfile = subscribeProfile(() => {
      setProfile(getShopProfile());
    });
    return () => {
      unsubItems();
      unsubProfile();
    };
  }, []);

  // Root products (parentId === null)
  const rootProducts = useMemo(() => {
    return allItems.filter((item) => item.parentId === null);
  }, [allItems]);

  // Compute Categories list dynamically
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(rootProducts.map((p) => p.category))
    );
    return ["All", ...uniqueCategories];
  }, [rootProducts]);

  // Compute Dashboard Metrics dynamically from full items list
  const metrics = useMemo(() => {
    const totalProducts = rootProducts.length;
    const uniqueCategories = new Set(rootProducts.map((p) => p.category)).size;
    const lowStockCount = allItems.filter(
      (i) => i.stock > 0 && i.stock <= 10
    ).length;
    const outOfStockCount = allItems.filter((i) => i.stock === 0).length;

    return {
      totalProducts,
      categoriesCount: uniqueCategories,
      lowStockCount,
      outOfStockCount,
    };
  }, [rootProducts, allItems]);

  // Filter products by search, selected category, and stock filter
  const filteredProducts = useMemo(() => {
    // If stockFilter is active, search across ALL store items (products + parts + sub-parts)
    const baseList = stockFilter === "All" ? rootProducts : allItems;

    return baseList.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;

      let matchesStock = true;
      if (stockFilter === "LowStock") {
        matchesStock = item.stock > 0 && item.stock <= 10;
      } else if (stockFilter === "OutOfStock") {
        matchesStock = item.stock === 0;
      }

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [rootProducts, allItems, search, selectedCategory, stockFilter]);

  return (
    <SafeAreaView style={styles.container}>
      {/* App Header */}
      <Header
        title={profile.shopName}
        subtitle="Product & Stock Management"
        onMenuPress={() => setIsMenuOpen(true)}
        onProfilePress={() => router.push("/profile")}
        onNotificationPress={() => {
          setStockFilter(stockFilter === "LowStock" ? "All" : "LowStock");
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search Bar */}
        <SearchBar value={search} onChangeText={setSearch} />

        {/* Active Stock Filter Alert Banner if active */}
        {stockFilter !== "All" && (
          <View style={styles.filterBanner}>
            <Ionicons
              name={stockFilter === "LowStock" ? "warning" : "close-circle"}
              size={18}
              color={stockFilter === "LowStock" ? "#F57C00" : "#D32F2F"}
            />
            <Text style={styles.filterBannerText}>
              Showing {stockFilter === "LowStock" ? "Low Stock" : "Out of Stock"}{" "}
              Items
            </Text>
            <TouchableOpacity onPress={() => setStockFilter("All")}>
              <Text style={styles.filterClearText}>Reset Filter</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 2x2 Interactive Dashboard Metrics Summary */}
        <View style={styles.dashboardGrid}>
          <DashboardCard
            title="Products"
            value={metrics.totalProducts.toString()}
            icon="cube"
            color="#0A4DFF"
            onPress={() => setStockFilter("All")}
          />

          <DashboardCard
            title="Categories"
            value={metrics.categoriesCount.toString().padStart(2, "0")}
            icon="grid"
            color="#27AE60"
            onPress={() => setStockFilter("All")}
          />

          <DashboardCard
            title="Low Stock"
            value={metrics.lowStockCount.toString().padStart(2, "0")}
            icon="warning"
            color="#F39C12"
            onPress={() =>
              setStockFilter(stockFilter === "LowStock" ? "All" : "LowStock")
            }
          />

          <DashboardCard
            title="Out of Stock"
            value={metrics.outOfStockCount.toString().padStart(2, "0")}
            icon="close-circle"
            color="#E74C3C"
            onPress={() =>
              setStockFilter(
                stockFilter === "OutOfStock" ? "All" : "OutOfStock"
              )
            }
          />
        </View>

        {/* Categories Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <Text style={styles.sectionBadge}>{categories.length - 1} Types</Text>
        </View>

        <CategoryList
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Main Products / Stock Filtered List Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {stockFilter === "OutOfStock"
              ? "🔴 Out of Stock Items"
              : stockFilter === "LowStock"
              ? "🟠 Low Stock Alert Items"
              : "Main Products"}
          </Text>
          <Text style={styles.sectionBadge}>{filteredProducts.length} Items</Text>
        </View>

        <View style={styles.productsList}>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onPress={() => {
                  router.push({
                    pathname: "/item-detail",
                    params: { id: item.id.toString() },
                  });
                }}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No Products Found</Text>
              <Text style={styles.emptySubtitle}>
                Try searching with a different product name or category filter.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Add Product Button */}
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.fabButton}
        onPress={() => {
          router.push({
            pathname: "/add-product",
            params: { parentId: "" },
          });
        }}
      >
        <Ionicons name="add" size={26} color="#FFFFFF" />
        <Text style={styles.fabText}>Add Product</Text>
      </TouchableOpacity>

      {/* SIDE DRAWER MENU MODAL (☰ Click) */}
      <Modal
        visible={isMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsMenuOpen(false)}
      >
        <View style={styles.menuOverlay}>
          <View style={styles.menuContent}>
            <View style={styles.menuHeader}>
              <View style={styles.menuAvatar}>
                <MaterialCommunityIcons name="store" size={32} color="#0A4DFF" />
              </View>
              <View style={styles.menuHeaderInfo}>
                <Text style={styles.menuShopName}>{profile.shopName}</Text>
                <Text style={styles.menuOwnerName}>Owner: {profile.ownerName}</Text>
              </View>
              <TouchableOpacity onPress={() => setIsMenuOpen(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.menuDivider} />

            {/* Menu Options */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setIsMenuOpen(false);
                setStockFilter("All");
              }}
            >
              <Ionicons name="home-outline" size={22} color="#0F172A" />
              <Text style={styles.menuItemText}>Dashboard & All Items</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setIsMenuOpen(false);
                setStockFilter("LowStock");
              }}
            >
              <Ionicons name="warning-outline" size={22} color="#F57C00" />
              <Text style={styles.menuItemText}>Low Stock Alert Items</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setIsMenuOpen(false);
                setStockFilter("OutOfStock");
              }}
            >
              <Ionicons name="close-circle-outline" size={22} color="#D32F2F" />
              <Text style={styles.menuItemText}>Out of Stock Items</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setIsMenuOpen(false);
                router.push({
                  pathname: "/add-product",
                  params: { parentId: "" },
                });
              }}
            >
              <Ionicons name="add-circle-outline" size={22} color="#0A4DFF" />
              <Text style={styles.menuItemText}>Add New Main Product</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setIsMenuOpen(false);
                router.push("/profile");
              }}
            >
              <Ionicons name="person-outline" size={22} color="#0F172A" />
              <Text style={styles.menuItemText}>Shop & Owner Profile</Text>
            </TouchableOpacity>
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

  scrollContent: {
    paddingBottom: 90,
  },

  filterBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FFE0B2",
  },

  filterBannerText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#E65100",
    marginLeft: 8,
    flex: 1,
  },

  filterClearText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0A4DFF",
    textDecorationLine: "underline",
  },

  dashboardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 16,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 8,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },

  sectionBadge: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },

  productsList: {
    marginTop: 4,
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 36,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
    marginTop: 12,
  },

  emptySubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginTop: 4,
  },

  fabButton: {
    position: "absolute",
    bottom: 24,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0A4DFF",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    elevation: 6,
    shadowColor: "#0A4DFF",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },

  fabText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 6,
  },

  // MENU MODAL STYLES
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "flex-start",
  },

  menuContent: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    padding: 20,
    elevation: 8,
  },

  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  menuAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },

  menuHeaderInfo: {
    flex: 1,
  },

  menuShopName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },

  menuOwnerName: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
    fontWeight: "500",
  },

  menuDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 16,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginBottom: 4,
  },

  menuItemText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
    marginLeft: 14,
  },
});