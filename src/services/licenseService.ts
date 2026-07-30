import AsyncStorage from "@react-native-async-storage/async-storage";
import { APP_CONFIG } from "../config/appConfig";

const LICENSE_STORAGE_KEY = "@chhabra_app_license_v1";

export interface AppLicenseState {
  isLocked: boolean;
  lockReason: string;
  expiryDate: string;
  lastChecked: string;
  isCustomUnlocked: boolean;
  allowKeyUnlock: boolean;
}

let currentLicenseState: AppLicenseState = {
  isLocked: false,
  lockReason: "Subscription Expired",
  expiryDate: APP_CONFIG.defaultExpiryDate,
  lastChecked: new Date().toISOString(),
  isCustomUnlocked: false,
  allowKeyUnlock: true,
};

type Listener = () => void;
const listeners: Set<Listener> = new Set();

export const subscribeLicense = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const notifyListeners = () => {
  saveLicenseToStorage();
  listeners.forEach((l) => l());
};

const saveLicenseToStorage = async () => {
  try {
    await AsyncStorage.setItem(
      LICENSE_STORAGE_KEY,
      JSON.stringify(currentLicenseState)
    );
  } catch (e) {
    console.error("Failed to save license state", e);
  }
};

export const checkRemoteCloudLicense = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(APP_CONFIG.remoteLicenseUrl, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && typeof data.isLocked === "boolean") {
        currentLicenseState.isLocked = data.isLocked;
        if (data.lockReason) {
          currentLicenseState.lockReason = data.lockReason;
        }
        if (data.expiryDate) {
          currentLicenseState.expiryDate = data.expiryDate;
        }
        if (typeof data.allowKeyUnlock === "boolean") {
          currentLicenseState.allowKeyUnlock = data.allowKeyUnlock;
        } else {
          currentLicenseState.allowKeyUnlock = true;
        }
        currentLicenseState.lastChecked = new Date().toISOString();
        notifyListeners();
      }
    }
  } catch (e) {
    checkExpiryDate();
  }
};

export const loadLicenseFromStorage = async () => {
  try {
    const val = await AsyncStorage.getItem(LICENSE_STORAGE_KEY);
    if (val) {
      currentLicenseState = { ...currentLicenseState, ...JSON.parse(val) };
      checkExpiryDate();
      notifyListeners();
    } else {
      checkExpiryDate();
    }
    // Check remote cloud status online
    checkRemoteCloudLicense();
  } catch (e) {
    console.error("Failed to load license state", e);
  }
};

// Calculates the last day of the current month (e.g. 31st Jan, 28th Feb, 31st March, 30th April)
export const getDynamicMonthEndDate = (date = new Date()): string => {
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const year = lastDay.getFullYear();
  const month = String(lastDay.getMonth() + 1).padStart(2, "0");
  const day = String(lastDay.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Calculates the last day of NEXT month
export const getDynamicNextMonthEndDate = (): string => {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);
  const year = nextMonth.getFullYear();
  const month = String(nextMonth.getMonth() + 1).padStart(2, "0");
  const day = String(nextMonth.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Check if current date > expiry date (Default: Month End Date)
const checkExpiryDate = () => {
  if (currentLicenseState.isCustomUnlocked) {
    currentLicenseState.isLocked = false;
    return;
  }
  const today = new Date().toISOString().split("T")[0];
  const activeExpiry = currentLicenseState.expiryDate || getDynamicMonthEndDate();

  if (today > activeExpiry) {
    currentLicenseState.isLocked = true;
    currentLicenseState.lockReason =
      "Monthly Subscription Period Expired. Please contact Admin Deepak Raj to renew.";
  }
};

// Initialize via RootLayout lifecycle

export const getLicenseState = (): AppLicenseState => ({
  ...currentLicenseState,
  expiryDate: currentLicenseState.expiryDate || getDynamicMonthEndDate(),
});

// Admin Remote Control API (To Lock or Unlock App remotely)
export const setRemoteLockStatus = (
  isLocked: boolean,
  reason: string = "Subscription Payment Pending",
  newExpiryDate?: string
) => {
  currentLicenseState.isLocked = isLocked;
  currentLicenseState.lockReason = reason;
  currentLicenseState.isCustomUnlocked = !isLocked;
  if (newExpiryDate) {
    currentLicenseState.expiryDate = newExpiryDate;
  }
  currentLicenseState.lastChecked = new Date().toISOString();
  notifyListeners();
};

// Unpredictable Secret Monthly Passcode (e.g. 6195-RAJ, 4588-RAJ) - Impossible for user to guess!
export const getUnpredictableMonthlyPasscode = (date = new Date()): string => {
  const m = date.getMonth() + 1;
  const y = date.getFullYear();
  const secretNum = ((m * 7392 + y * 17) % 8999) + 1000;
  return `${secretNum}-RAJ`;
};

// Admin Unlock with Master Key or Unpredictable Monthly Passcode
export const unlockAppWithKey = (inputKey: string): boolean => {
  const cleanInput = inputKey.trim().toUpperCase();
  const masterKey = APP_CONFIG.masterLicenseKey.toUpperCase();
  const currentSecretPasscode = getUnpredictableMonthlyPasscode();

  if (cleanInput === masterKey || cleanInput === currentSecretPasscode) {
    // 1. Immediately turn off lock
    currentLicenseState.isLocked = false;
    currentLicenseState.isCustomUnlocked = true;
    // 2. Extend subscription to end of next month
    currentLicenseState.expiryDate = getDynamicNextMonthEndDate();
    // 3. Save to local storage automatically so isLocked becomes false
    notifyListeners();
    return true;
  }
  return false;
};
