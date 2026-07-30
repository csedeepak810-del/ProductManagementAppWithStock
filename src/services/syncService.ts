import AsyncStorage from "@react-native-async-storage/async-storage";
import { APP_CONFIG } from "../config/appConfig";
import { getItems, replaceItemsData, subscribeItems } from "../data/items";
import { getShopProfile, subscribeProfile, updateShopProfile } from "../data/profile";

export interface BackupPayload {
  version: string;
  timestamp: string;
  shopProfile: any;
  items: any[];
}

// Generate complete JSON Backup String of entire store (items, sub-parts, stock counts, profile)
export const exportFullBackupJson = (): string => {
  const currentItems = getItems();
  const currentProfile = getShopProfile();
  const payload: BackupPayload = {
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    shopProfile: currentProfile,
    items: currentItems,
  };
  return JSON.stringify(payload, null, 2);
};

// Auto Sync Cloud Snapshot to AsyncStorage & Dedicated Cloud Backup Storage Gateway
export const autoCloudSyncSnapshot = async () => {
  try {
    const jsonStr = exportFullBackupJson();
    // 1. Save to local phone storage
    await AsyncStorage.setItem(APP_CONFIG.backupKey, jsonStr);

    // 2. Silent background sync to Dedicated Backup Cloud Gateway
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    fetch(APP_CONFIG.remoteBackupUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: jsonStr,
      signal: controller.signal,
    })
      .then(() => clearTimeout(timeoutId))
      .catch(() => clearTimeout(timeoutId));

    return true;
  } catch (e) {
    console.error("Auto cloud sync failed", e);
    return false;
  }
};

// Download latest backup JSON snapshot directly from Cloud Server & restore it
export const restoreFromCloud = async (): Promise<{
  success: boolean;
  itemCount: number;
  message: string;
}> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const response = await fetch(APP_CONFIG.remoteBackupUrl, {
      method: "GET",
      headers: { "Cache-Control": "no-cache" },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.text();
      return await restoreFromBackupJson(data);
    } else {
      return {
        success: false,
        itemCount: 0,
        message: "Failed to fetch cloud backup. Server returned error status.",
      };
    }
  } catch (e: any) {
    return {
      success: false,
      itemCount: 0,
      message: `Cloud Fetch Error: ${e.message || "Network timeout / offline"}`,
    };
  }
};

// Restore entire shop data (Products, sub-parts, stock numbers, profile) from backup JSON string
export const restoreFromBackupJson = async (
  jsonString: string
): Promise<{ success: boolean; itemCount: number; message: string }> => {
  try {
    // Sanitize string (remove hidden Unicode characters from WhatsApp / Clipboard)
    const sanitized = jsonString
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .trim();

    const parsed: BackupPayload = JSON.parse(sanitized);

    if (!parsed || !parsed.items || !Array.isArray(parsed.items)) {
      return {
        success: false,
        itemCount: 0,
        message: "Invalid backup JSON: Items list not found in backup code.",
      };
    }

    // 1. Restore Profile if present
    if (parsed.shopProfile) {
      updateShopProfile(parsed.shopProfile);
    }

    // 2. Restore Items & Sub-parts
    replaceItemsData(parsed.items);

    // 3. Save to AsyncStorage
    await autoCloudSyncSnapshot();

    return {
      success: true,
      itemCount: parsed.items.length,
      message: `Successfully restored ${parsed.items.length} items & shop profile!`,
    };
  } catch (e: any) {
    return {
      success: false,
      itemCount: 0,
      message: `Backup Restore Failed: ${e.message || "Invalid JSON Code"}`,
    };
  }
};

// Subscribe to store updates to trigger auto cloud sync
subscribeItems(() => {
  autoCloudSyncSnapshot();
});

subscribeProfile(() => {
  autoCloudSyncSnapshot();
});
