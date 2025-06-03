// 🏗️ Expense Tracker Pro - Type Definitions
// Tipi base per l'applicazione di gestione spese condivise

// ==================== CORE ENTITIES ====================

export interface Person {
  id: string;
  name: string;
  email?: string;
  avatar: string; // Emoji avatar
  createdAt: string;
}

export interface Trip {
  id: string;
  name: string;
  description?: string;
  startDate: string; // ISO date string
  endDate: string;   // ISO date string
  people: string[];  // Array of person IDs
  createdBy: string; // Person ID
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
}

export interface Expense {
  id: string;
  tripId: string;
  description: string;
  amount: number;
  paidBy: string;        // Person ID who paid
  participants: string[]; // Person IDs who participated
  category: ExpenseCategory;
  date: string;          // ISO date string
  isSettled: boolean;    // Se la spesa è stata rimborsata
  createdAt: string;     // ISO datetime string
  updatedAt: string;     // ISO datetime string
}

// ==================== ENUMS & UNIONS ====================

export type ExpenseCategory = 'food' | 'transport' | 'accommodation' | 'entertainment' | 'shopping' | 'other';

export const EXPENSE_CATEGORIES: Record<ExpenseCategory, { label: string; icon: string; color: string }> = {
  food: { label: 'Cibo', icon: '🍽️', color: 'bg-orange-100 text-orange-800' },
  transport: { label: 'Trasporti', icon: '🚗', color: 'bg-blue-100 text-blue-800' },
  accommodation: { label: 'Alloggio', icon: '🏨', color: 'bg-purple-100 text-purple-800' },
  entertainment: { label: 'Intrattenimento', icon: '🎉', color: 'bg-pink-100 text-pink-800' },
  shopping: { label: 'Shopping', icon: '🛍️', color: 'bg-green-100 text-green-800' },
  other: { label: 'Altro', icon: '📋', color: 'bg-gray-100 text-gray-800' },
};

// ==================== CALCULATED DATA ====================

export interface PersonBalance {
  personId: string;
  person: Person;
  totalPaid: number;     // Quanto ha pagato in totale
  totalOwed: number;     // Quanto deve in totale
  balance: number;       // Differenza (positivo = creditore, negativo = debitore)
}

export interface Settlement {
  from: Person;          // Chi deve pagare
  to: Person;            // Chi deve ricevere
  amount: number;        // Importo da trasferire
}

export interface TripSummary {
  trip: Trip;
  totalExpenses: number;
  totalAmount: number;
  expenseCount: number;
  peopleCount: number;
  averagePerPerson: number;
  topCategory: ExpenseCategory;
  balances: PersonBalance[];
  settlements: Settlement[];
}

// ==================== FORM DATA ====================

export interface TripFormData {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  people: string[]; // Person IDs
}

export interface PersonFormData {
  name: string;
  email?: string;
  avatar: string;
}

export interface ExpenseFormData {
  description: string;
  amount: number | string; // string for form input, number for processing
  paidBy: string;          // Person ID
  participants: string[];   // Person IDs
  category: ExpenseCategory;
  date: string;
}

// ==================== UI STATE ====================

export interface AppState {
  trips: Trip[];
  people: Person[];
  expenses: Expense[];
  currentTrip: string | null; // Current trip ID
  isLoading: boolean;
  error: string | null;
}

export type AppAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CURRENT_TRIP'; payload: string | null }
  
  // Trip actions
  | { type: 'ADD_TRIP'; payload: Trip }
  | { type: 'UPDATE_TRIP'; payload: Trip }
  | { type: 'DELETE_TRIP'; payload: string }
  | { type: 'SET_TRIPS'; payload: Trip[] }
  
  // Person actions  
  | { type: 'ADD_PERSON'; payload: Person }
  | { type: 'UPDATE_PERSON'; payload: Person }
  | { type: 'DELETE_PERSON'; payload: string }
  | { type: 'SET_PEOPLE'; payload: Person[] }
  
  // Expense actions
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'UPDATE_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'SET_EXPENSES'; payload: Expense[] }
  | { type: 'TOGGLE_EXPENSE_SETTLED'; payload: string };

// ==================== COMPONENT PROPS ====================

export interface TripCardProps {
  trip: Trip;
  summary: TripSummary;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export interface ExpenseCardProps {
  expense: Expense;
  people: Person[];
  onEdit: () => void;
  onDelete: () => void;
  onToggleSettled: () => void;
}

export interface PersonSelectorProps {
  people: Person[];
  selected: string[];
  onChange: (selected: string[]) => void;
  disabled?: boolean;
}

export interface BalanceCardProps {
  balance: PersonBalance;
  compact?: boolean;
}

// ==================== API RESPONSES (future) ====================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ==================== UTILITY TYPES ====================

export type ID = string;
export type ISODate = string;
export type Currency = number;

// Helper type for form validation
export type ValidationError = {
  field: string;
  message: string;
};

export type FormErrors<T> = {
  [K in keyof T]?: string;
};

// ==================== CONSTANTS ====================

export const AVATAR_OPTIONS = [
  '👨‍💼', '👩‍💼', '👨‍🎓', '👩‍🎓', '👨‍🍳', '👩‍🍳',
  '👨‍🎨', '👩‍🎨', '👨‍⚕️', '👩‍⚕️', '👨‍🔬', '👩‍🔬',
  '🧑‍💻', '👨‍💻', '👩‍💻', '🧑‍🎤', '👨‍🎤', '👩‍🎤',
  '🧑‍🌾', '👨‍🌾', '👩‍🌾', '🧑‍🏫', '👨‍🏫', '👩‍🏫',
  '🧙‍♂️', '🧙‍♀️', '🦸‍♂️', '🦸‍♀️', '🧝‍♂️', '🧝‍♀️'
];

export const LOCAL_STORAGE_KEYS = {
  TRIPS: 'expense-tracker-trips',
  PEOPLE: 'expense-tracker-people', 
  EXPENSES: 'expense-tracker-expenses',
  CURRENT_TRIP: 'expense-tracker-current-trip',
} as const;

// ==================== DEFAULT VALUES ====================

export const DEFAULT_PERSON: Omit<Person, 'id' | 'createdAt'> = {
  name: '',
  email: '',
  avatar: '👨‍💼',
};

export const DEFAULT_TRIP: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  people: [],
  createdBy: '',
};

export const DEFAULT_EXPENSE: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'> = {
  tripId: '',
  description: '',
  amount: 0,
  paidBy: '',
  participants: [],
  category: 'other',
  date: '',
  isSettled: false,
};

export const INITIAL_APP_STATE: AppState = {
  trips: [],
  people: [],
  expenses: [],
  currentTrip: null,
  isLoading: false,
  error: null,
};
