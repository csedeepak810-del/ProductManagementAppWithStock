import { Stack } from "expo-router";
import React, { useEffect } from "react";
import AppLockModal from "../components/AppLockModal";
import { loadFromStorage } from "../data/items";
import { loadProfileFromStorage } from "../data/profile";
import { checkRemoteCloudLicense, loadLicenseFromStorage } from "../services/licenseService";

export default function RootLayout() {
  useEffect(() => {
    // Safely initialize local storage after React Native bridge mounts
    loadFromStorage();
    loadProfileFromStorage();
    loadLicenseFromStorage();

    // Check remote cloud status every 8 seconds for live real-time lock/unlock
    const interval = setInterval(() => {
      checkRemoteCloudLicense();
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
      <AppLockModal />
    </>
  );
}
