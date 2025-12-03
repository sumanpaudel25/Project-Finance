import { Coffee, Briefcase, Zap, Home, Car, ShoppingCart, Film, HeartPulse, MoreHorizontal, GraduationCap, Plane, Gift, Wifi, Smartphone, Wrench } from 'lucide-react';
import { Category } from './types';

// Map string keys to Lucide components for dynamic rendering
export const ICON_MAP: Record<string, any> = {
  briefcase: Briefcase,
  zap: Zap,
  home: Home,
  car: Car,
  coffee: Coffee,
  shopping: ShoppingCart,
  film: Film,
  heart: HeartPulse,
  more: MoreHorizontal,
  school: GraduationCap,
  plane: Plane,
  gift: Gift,
  wifi: Wifi,
  phone: Smartphone,
  tool: Wrench
};

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'salary', name: 'Salary/Wages', iconName: 'briefcase', color: 'text-green-500', isDefault: true },
  { id: 'freelance', name: 'Freelance', iconName: 'zap', color: 'text-blue-500', isDefault: true },
  { id: 'housing', name: 'Housing', iconName: 'home', color: 'text-orange-500', isDefault: true },
  { id: 'transport', name: 'Transport', iconName: 'car', color: 'text-indigo-500', isDefault: true },
  { id: 'food', name: 'Food & Dining', iconName: 'coffee', color: 'text-amber-700', isDefault: true },
  { id: 'shopping', name: 'Shopping', iconName: 'shopping', color: 'text-pink-500', isDefault: true },
  { id: 'entertainment', name: 'Entertainment', iconName: 'film', color: 'text-purple-500', isDefault: true },
  { id: 'health', name: 'Health', iconName: 'heart', color: 'text-red-500', isDefault: true },
  { id: 'other', name: 'Other', iconName: 'more', color: 'text-gray-500', isDefault: true },
];

export const AVAILABLE_COLORS = [
  { name: 'Red', class: 'text-red-500' },
  { name: 'Orange', class: 'text-orange-500' },
  { name: 'Amber', class: 'text-amber-500' },
  { name: 'Green', class: 'text-green-500' },
  { name: 'Emerald', class: 'text-emerald-500' },
  { name: 'Teal', class: 'text-teal-500' },
  { name: 'Cyan', class: 'text-cyan-500' },
  { name: 'Blue', class: 'text-blue-500' },
  { name: 'Indigo', class: 'text-indigo-500' },
  { name: 'Violet', class: 'text-violet-500' },
  { name: 'Purple', class: 'text-purple-500' },
  { name: 'Fuchsia', class: 'text-fuchsia-500' },
  { name: 'Pink', class: 'text-pink-500' },
  { name: 'Rose', class: 'text-rose-500' },
  { name: 'Gray', class: 'text-gray-500' },
];

export const DEFAULT_CURRENCY = 'USD';