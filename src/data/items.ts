import AsyncStorage from "@react-native-async-storage/async-storage";
import { Item } from "../types/item";

const STORAGE_KEY = "@chhabra_inventory_items_v2";

export let itemsData: Item[] = [
  // =========================================================================
  // LEVEL 1: MAIN PRODUCTS (parentId: null)
  // =========================================================================
  {
    id: 1,
    name: "Washing Machine 7.5 Kg Semi-Auto",
    parentId: null,
    category: "Appliance",
    stock: 15,
    unit: "PCS",
    icon: "washing-machine",
  },
  {
    id: 10,
    name: "Luminous Inverter 900VA Pure Sine Wave",
    parentId: null,
    category: "Inverter",
    stock: 8,
    unit: "PCS",
    icon: "flash",
  },
  {
    id: 20,
    name: "Luminous Solar Battery 150Ah Tubular",
    parentId: null,
    category: "Battery",
    stock: 4,
    unit: "PCS",
    icon: "battery-charging",
  },
  {
    id: 30,
    name: "Crompton High Speed Ceiling Fan 1200mm",
    parentId: null,
    category: "Fan",
    stock: 5,
    unit: "PCS",
    icon: "fan",
  },
  {
    id: 40,
    name: "Havells MCB 32A Double Pole C-Curve",
    parentId: null,
    category: "MCB",
    stock: 0,
    unit: "PCS",
    icon: "toggle-switch",
  },
  {
    id: 50,
    name: "Polycab 1.5 Sq mm Copper Wire (Red Roll)",
    parentId: null,
    category: "Wire",
    stock: 350,
    unit: "Meter",
    icon: "resistor",
  },
  {
    id: 60,
    name: "Anchor Modular Switch 16A Heavy Duty",
    parentId: null,
    category: "Switch",
    stock: 85,
    unit: "PCS",
    icon: "power-socket-us",
  },
  {
    id: 70,
    name: "Philips 20W Cool Day LED Tube Light",
    parentId: null,
    category: "LED",
    stock: 3,
    unit: "PCS",
    icon: "lightbulb-on",
  },
  {
    id: 80,
    name: "Voltas 1.5 Ton 3 Star Inverter Split AC",
    parentId: null,
    category: "Appliance",
    stock: 6,
    unit: "PCS",
    icon: "air-conditioner",
  },
  {
    id: 90,
    name: "Godrej 240L Double Door Refrigerator",
    parentId: null,
    category: "Appliance",
    stock: 7,
    unit: "PCS",
    icon: "fridge",
  },

  // =========================================================================
  // LEVEL 2: PARTS (parentId: Level 1 ID)
  // =========================================================================

  // --- 1. WASHING MACHINE PARTS (parentId: 1) ---
  {
    id: 2,
    name: "Wash Motor Assembly 180W Copper Winding",
    parentId: 1,
    category: "Part",
    stock: 12,
    unit: "PCS",
    icon: "engine",
  },
  {
    id: 5,
    name: "Drain Pump Motor Assembly 30W",
    parentId: 1,
    category: "Part",
    stock: 8,
    unit: "PCS",
    icon: "cog",
  },
  {
    id: 6,
    name: "Spin Timer Mechanical Selector Unit",
    parentId: 1,
    category: "Part",
    stock: 9,
    unit: "PCS",
    icon: "timer-outline",
  },
  {
    id: 7,
    name: "Heavy Duty Corrugated Drain Pipe 2m",
    parentId: 1,
    category: "Part",
    stock: 50,
    unit: "Meter",
    icon: "pipe",
  },
  {
    id: 9,
    name: "Gearbox Assembly for Wash Pulsator",
    parentId: 1,
    category: "Part",
    stock: 6,
    unit: "PCS",
    icon: "cog-transfer",
  },

  // --- 2. INVERTER PARTS (parentId: 10) ---
  {
    id: 11,
    name: "Copper Heavy Mains Transformer 800W",
    parentId: 10,
    category: "Part",
    stock: 6,
    unit: "PCS",
    icon: "current-ac",
  },
  {
    id: 12,
    name: "Main Microcontroller PCB Motherboard",
    parentId: 10,
    category: "Part",
    stock: 4,
    unit: "PCS",
    icon: "chip",
  },
  {
    id: 15,
    name: "12V DC High Speed Cooling Fan",
    parentId: 10,
    category: "Part",
    stock: 15,
    unit: "PCS",
    icon: "fan",
  },

  // --- 3. BATTERY PARTS (parentId: 20) ---
  {
    id: 21,
    name: "Heavy Lead Terminal Lead Clamp Plug",
    parentId: 20,
    category: "Part",
    stock: 15,
    unit: "PCS",
    icon: "power-plug",
  },
  {
    id: 22,
    name: "Battery Acid Electrolyte Grade A (1.280 SG)",
    parentId: 20,
    category: "Part",
    stock: 60,
    unit: "Litre",
    icon: "flask-outline",
  },
  {
    id: 23,
    name: "Hydro-Eye Water Level Indicator Cap",
    parentId: 20,
    category: "Part",
    stock: 40,
    unit: "PCS",
    icon: "eye-outline",
  },

  // --- 4. CEILING FAN PARTS (parentId: 30) ---
  {
    id: 31,
    name: "Fan Stator Winding Core 14-Pole",
    parentId: 30,
    category: "Part",
    stock: 7,
    unit: "PCS",
    icon: "circle-notch",
  },
  {
    id: 32,
    name: "Fan Capacitor 2.5uF 440V AC",
    parentId: 30,
    category: "Part",
    stock: 45,
    unit: "PCS",
    icon: "car-battery",
  },
  {
    id: 33,
    name: "Aerodynamic Aluminium Fan Blades (Set of 3)",
    parentId: 30,
    category: "Part",
    stock: 10,
    unit: "Set",
    icon: "fan-auto",
  },

  // --- 5. MCB PARTS (parentId: 40) ---
  {
    id: 41,
    name: "Bimetallic Thermal Overload Trip Strip",
    parentId: 40,
    category: "Part",
    stock: 12,
    unit: "PCS",
    icon: "lightning-bolt",
  },
  {
    id: 42,
    name: "Arc Chute Extinguisher Chamber",
    parentId: 40,
    category: "Part",
    stock: 20,
    unit: "PCS",
    icon: "shield-half-full",
  },

  // --- 6. SPLIT AC PARTS (parentId: 80) ---
  {
    id: 81,
    name: "Rotary Inverter Compressor Unit 1.5 Ton",
    parentId: 80,
    category: "Part",
    stock: 3,
    unit: "PCS",
    icon: "engine",
  },
  {
    id: 82,
    name: "Outdoor Condenser Copper Coil 100%",
    parentId: 80,
    category: "Part",
    stock: 4,
    unit: "PCS",
    icon: "air-conditioner",
  },
  {
    id: 83,
    name: "R32 Eco Refrigerant Gas Cylinder (12kg)",
    parentId: 80,
    category: "Part",
    stock: 8,
    unit: "PCS",
    icon: "gas-cylinder",
  },

  // --- 7. REFRIGERATOR PARTS (parentId: 90) ---
  {
    id: 91,
    name: "Inverter Refrigerator Compressor 1/4 HP",
    parentId: 90,
    category: "Part",
    stock: 5,
    unit: "PCS",
    icon: "engine",
  },
  {
    id: 92,
    name: "Automatic Defrost Thermostat Sensor",
    parentId: 90,
    category: "Part",
    stock: 18,
    unit: "PCS",
    icon: "thermometer",
  },
  {
    id: 93,
    name: "PTC Starter Relay & Overload Protector",
    parentId: 90,
    category: "Part",
    stock: 25,
    unit: "PCS",
    icon: "relay",
  },

  // =========================================================================
  // LEVEL 3: SUB PARTS (parentId: Level 2 ID)
  // =========================================================================

  // --- Sub Parts for Wash Motor (id: 2) ---
  {
    id: 3,
    name: "Motor Armature Rotor Shaft Assembly",
    parentId: 2,
    category: "Sub Part",
    stock: 10,
    unit: "PCS",
    icon: "axis-arrow",
  },
  {
    id: 4,
    name: "High Grade Carbon Brush Pair",
    parentId: 2,
    category: "Sub Part",
    stock: 30,
    unit: "PCS",
    icon: "toy-brick",
  },
  {
    id: 8,
    name: "Precision Motor Ball Bearing 6201 Z",
    parentId: 2,
    category: "Sub Part",
    stock: 25,
    unit: "PCS",
    icon: "ring",
  },

  // --- Sub Parts for Inverter PCB (id: 12) ---
  {
    id: 13,
    name: "High Surge Power MOSFET 50N06",
    parentId: 12,
    category: "Sub Part",
    stock: 80,
    unit: "PCS",
    icon: "integrated-circuit-chip",
  },
  {
    id: 14,
    name: "Heavy Duty Electromagnetic Relay 12V 30A",
    parentId: 12,
    category: "Sub Part",
    stock: 40,
    unit: "PCS",
    icon: "relay",
  },

  // --- Sub Parts for AC Compressor (id: 81) ---
  {
    id: 84,
    name: "Compressor Capacitor 45uF Dual",
    parentId: 81,
    category: "Sub Part",
    stock: 14,
    unit: "PCS",
    icon: "car-battery",
  },
  {
    id: 85,
    name: "Suction Accumulator Chamber",
    parentId: 81,
    category: "Sub Part",
    stock: 6,
    unit: "PCS",
    icon: "filter-variant",
  },

  // =========================================================================
  // LEVEL 4: SUB-SUB PARTS (parentId: Level 3 ID)
  // =========================================================================

  // --- Sub-sub Parts for Motor Armature (id: 3) ---
  {
    id: 101,
    name: "Super Enamelled Pure Copper Winding Wire 0.5mm",
    parentId: 3,
    category: "Sub-sub Part",
    stock: 250,
    unit: "Meter",
    icon: "resistor",
  },
  {
    id: 102,
    name: "Copper Commutator Segment Bar 24 Slot",
    parentId: 3,
    category: "Sub-sub Part",
    stock: 45,
    unit: "PCS",
    icon: "chart-bar",
  },

  // --- Sub-sub Parts for MOSFET (id: 13) ---
  {
    id: 103,
    name: "Aluminium Heatsink Thermal Pad 0.5mm",
    parentId: 13,
    category: "Sub-sub Part",
    stock: 120,
    unit: "PCS",
    icon: "square-medium",
  },
];

// Backwards compatibility export
export const items = itemsData;

// Data Observers
type Listener = () => void;
const listeners: Set<Listener> = new Set();

export const subscribeItems = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const notifyListeners = () => {
  saveToStorage();
  listeners.forEach((listener) => listener());
};

// Persistence Handlers (AsyncStorage)
const saveToStorage = async () => {
  try {
    const jsonValue = JSON.stringify(itemsData);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
  } catch (e) {
    console.error("Error saving inventory data to storage", e);
  }
};

export const loadFromStorage = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    if (jsonValue !== null) {
      const parsed = JSON.parse(jsonValue);
      if (Array.isArray(parsed) && parsed.length > 0) {
        itemsData = parsed;
        notifyListeners();
      }
    }
  } catch (e) {
    console.error("Error loading inventory data from storage", e);
  }
};

// Load storage via RootLayout lifecycle

export const replaceItemsData = (newItems: Item[]) => {
  itemsData = [...newItems];
  notifyListeners();
};

// Data Store API Methods
export const getItems = (): Item[] => [...itemsData];

export const getItemById = (id: number): Item | undefined => {
  return itemsData.find((item) => item.id === id);
};

export const getChildParts = (parentId: number | null): Item[] => {
  return itemsData.filter((item) => item.parentId === parentId);
};

export const updateStock = (id: number, newStock: number): boolean => {
  const item = itemsData.find((i) => i.id === id);
  if (item) {
    item.stock = newStock;
    notifyListeners();
    return true;
  }
  return false;
};

export const updateItem = (
  id: number,
  updatedFields: Partial<Omit<Item, "id">>
): boolean => {
  const index = itemsData.findIndex((i) => i.id === id);
  if (index !== -1) {
    itemsData[index] = {
      ...itemsData[index],
      ...updatedFields,
    };
    notifyListeners();
    return true;
  }
  return false;
};

export const addItem = (
  newItem: Omit<Item, "id"> & { id?: number }
): Item => {
  const newId = newItem.id || Math.max(...itemsData.map((i) => i.id), 0) + 1;
  const itemToAdd: Item = {
    ...newItem,
    id: newId,
  };
  itemsData.push(itemToAdd);
  notifyListeners();
  return itemToAdd;
};

export const deleteItem = (id: number): boolean => {
  const initialLength = itemsData.length;
  // Recursively delete sub-parts as well
  const deleteRecursive = (itemId: number) => {
    const children = itemsData.filter((i) => i.parentId === itemId);
    children.forEach((child) => deleteRecursive(child.id));
    itemsData = itemsData.filter((i) => i.id !== itemId);
  };

  deleteRecursive(id);
  notifyListeners();
  return itemsData.length < initialLength;
};