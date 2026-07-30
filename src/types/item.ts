export interface Item {
  id: number;
  name: string;
  parentId: number | null;
  category: string;
  stock: number;
  unit: string;
  icon?: string;
  notes?: string;
}