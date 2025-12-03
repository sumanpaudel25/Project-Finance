import { Project, Transaction, Category, AppData } from '../types';
import { DEFAULT_CATEGORIES } from '../constants';

const PROJECTS_KEY = 'fintrack_projects';
const TRANSACTIONS_KEY = 'fintrack_transactions';
const CATEGORIES_KEY = 'fintrack_categories';

// --- Projects ---
export const getProjects = (): Project[] => {
  const data = localStorage.getItem(PROJECTS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveProjects = (projects: Project[]) => {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
};

// --- Transactions ---
export const getTransactions = (projectId?: string): Transaction[] => {
  const data = localStorage.getItem(TRANSACTIONS_KEY);
  const allTransactions: Transaction[] = data ? JSON.parse(data) : [];
  if (projectId) {
    return allTransactions.filter(t => t.projectId === projectId);
  }
  return allTransactions;
};

export const saveTransactions = (transactions: Transaction[]) => {
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
};

export const addTransaction = (transaction: Transaction) => {
  const all = getTransactions();
  const updated = [...all, transaction];
  saveTransactions(updated);
  return updated;
};

export const deleteTransaction = (id: string) => {
  const all = getTransactions();
  const updated = all.filter(t => t.id !== id);
  saveTransactions(updated);
  return updated;
};

// --- Categories ---
export const getCategories = (): Category[] => {
  const data = localStorage.getItem(CATEGORIES_KEY);
  return data ? JSON.parse(data) : DEFAULT_CATEGORIES;
};

export const saveCategories = (categories: Category[]) => {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
};

// --- Full Sync Data ---
export const getAppData = (): AppData => {
  return {
    projects: getProjects(),
    transactions: getTransactions(),
    categories: getCategories(),
    lastSynced: new Date().toISOString(),
  };
};

export const overwriteAppData = (data: AppData) => {
  if (data.projects) saveProjects(data.projects);
  if (data.transactions) saveTransactions(data.transactions);
  if (data.categories) saveCategories(data.categories);
};