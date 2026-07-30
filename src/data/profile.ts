import AsyncStorage from "@react-native-async-storage/async-storage";

export interface ShopProfile {
  shopName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  gstNo: string;
  businessType: string;
  avatarUri?: string;
}

const PROFILE_STORAGE_KEY = "@chhabra_shop_profile_v1";

export let shopProfileData: ShopProfile = {
  shopName: "Chhabra Electricals",
  ownerName: "Varun Chhabra",
  phone: "+91 82877 75175",
  email: "contact@chhabraelectricals.com",
  address: "Shop No. 14, Main Electrical & Hardware Market, Near Bus Stand, Delhi-NCR",
  gstNo: "07AAACC1234H1Z8",
  businessType: "Electricals, Spares & Home Appliances",
  avatarUri: undefined,
};

type Listener = () => void;
const listeners: Set<Listener> = new Set();

export const subscribeProfile = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const notifyListeners = () => {
  saveProfileToStorage();
  listeners.forEach((l) => l());
};

const saveProfileToStorage = async () => {
  try {
    await AsyncStorage.setItem(
      PROFILE_STORAGE_KEY,
      JSON.stringify(shopProfileData)
    );
  } catch (e) {
    console.error("Failed to save shop profile", e);
  }
};

export const loadProfileFromStorage = async () => {
  try {
    const val = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
    if (val) {
      shopProfileData = { ...shopProfileData, ...JSON.parse(val) };
      notifyListeners();
    }
  } catch (e) {
    console.error("Failed to load shop profile", e);
  }
};

// Initialize via RootLayout lifecycle

export const getShopProfile = (): ShopProfile => ({ ...shopProfileData });

export const updateShopProfile = (updated: Partial<ShopProfile>) => {
  shopProfileData = { ...shopProfileData, ...updated };
  notifyListeners();
};
