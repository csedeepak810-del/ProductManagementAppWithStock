export const APP_CONFIG = {
  appName: "Chhabra Electricals Inventory System",
  adminName: "Deepak Raj (App Admin)",
  adminPhone: "+91 82877 75175",
  adminEmail: "deepak.g3842@gmail.com",

  // Master Admin Key to unlock app manually on any device
  masterLicenseKey: "CHHABRA2026",

  // Default Subscription Expiry (YYYY-MM-DD)
  defaultExpiryDate: "2026-12-31",

  // URL #1: Live Admin Control Gateway (ONLY for Remote Lock & Key Toggle)
  // Admin Deepak Raj can open https://jsonblob.com/019fadee-8cab-7d44-b774-cf58bd53a4f3 in browser to lock/unlock
  remoteLicenseUrl: "https://jsonblob.com/api/jsonBlob/019fadee-8cab-7d44-b774-cf58bd53a4f3",

  // URL #2: Dedicated Cloud Auto-Sync Backup Storage Gateway (ONLY for Client Product & Profile Backups)
  // Admin can open https://jsonblob.com/019fb192-819b-7327-bf83-c582aacc4dbe to view client product backup
  remoteBackupUrl: "https://jsonblob.com/api/jsonBlob/019fb192-819b-7327-bf83-c582aacc4dbe",

  // Backup Key
  backupKey: "@chhabra_inventory_cloud_backup_v1",
};
