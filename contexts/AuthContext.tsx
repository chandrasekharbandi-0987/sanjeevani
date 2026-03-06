import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'donor' | 'recipient' | 'doctor' | 'admin';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  bloodGroup: BloodGroup;
  city: string;
  hospital?: string;
  licenseNumber?: string;
  availability?: boolean;
  lastDonationDate?: string;
  requiredBloodGroup?: BloodGroup;
  emergencyContact?: string;
  totalDonations?: number;
  createdAt: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  bloodGroup: BloodGroup;
  city: string;
  hospital?: string;
  licenseNumber?: string;
  availability?: boolean;
  lastDonationDate?: string;
  requiredBloodGroup?: BloodGroup;
  emergencyContact?: string;
}

interface StoredUser extends User {
  password: string;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEYS = {
  CURRENT_USER: 'sanjeevani_current_user',
  ALL_USERS: 'sanjeevani_all_users',
};

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

const SEED_USERS: StoredUser[] = [
  {
    id: 'admin-1',
    name: 'Dr. Admin Kumar',
    email: 'admin@sanjeevani.com',
    phone: '9876543210',
    password: 'admin123',
    role: 'admin',
    bloodGroup: 'O+',
    city: 'Mumbai',
    createdAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'donor-1',
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    phone: '9876543211',
    password: 'donor123',
    role: 'donor',
    bloodGroup: 'B+',
    city: 'Mumbai',
    availability: true,
    lastDonationDate: '2024-09-15',
    totalDonations: 5,
    createdAt: new Date('2024-02-01').toISOString(),
  },
  {
    id: 'donor-2',
    name: 'Priya Patel',
    email: 'priya@example.com',
    phone: '9876543212',
    password: 'donor123',
    role: 'donor',
    bloodGroup: 'A+',
    city: 'Delhi',
    availability: true,
    lastDonationDate: '2024-08-20',
    totalDonations: 3,
    createdAt: new Date('2024-02-15').toISOString(),
  },
  {
    id: 'donor-3',
    name: 'Amit Singh',
    email: 'amit@example.com',
    phone: '9876543213',
    password: 'donor123',
    role: 'donor',
    bloodGroup: 'O-',
    city: 'Bangalore',
    availability: false,
    lastDonationDate: '2024-10-01',
    totalDonations: 8,
    createdAt: new Date('2024-03-01').toISOString(),
  },
  {
    id: 'donor-4',
    name: 'Sneha Reddy',
    email: 'sneha@example.com',
    phone: '9876543214',
    password: 'donor123',
    role: 'donor',
    bloodGroup: 'AB+',
    city: 'Hyderabad',
    availability: true,
    lastDonationDate: '2024-07-10',
    totalDonations: 2,
    createdAt: new Date('2024-03-15').toISOString(),
  },
  {
    id: 'donor-5',
    name: 'Vikram Nair',
    email: 'vikram@example.com',
    phone: '9876543219',
    password: 'donor123',
    role: 'donor',
    bloodGroup: 'O+',
    city: 'Mumbai',
    availability: true,
    lastDonationDate: '2024-06-20',
    totalDonations: 12,
    createdAt: new Date('2024-03-20').toISOString(),
  },
  {
    id: 'recipient-1',
    name: 'Meera Joshi',
    email: 'meera@example.com',
    phone: '9876543215',
    password: 'recipient123',
    role: 'recipient',
    bloodGroup: 'O+',
    city: 'Mumbai',
    hospital: 'Apollo Hospital',
    requiredBloodGroup: 'O+',
    emergencyContact: '9876543000',
    createdAt: new Date('2024-04-01').toISOString(),
  },
  {
    id: 'doctor-1',
    name: 'Dr. Kavitha Menon',
    email: 'doctor@example.com',
    phone: '9876543216',
    password: 'doctor123',
    role: 'doctor',
    bloodGroup: 'A-',
    city: 'Mumbai',
    hospital: 'Lilavati Hospital',
    licenseNumber: 'MH-DOC-2024-001',
    createdAt: new Date('2024-01-15').toISOString(),
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  async function initializeApp() {
    try {
      const existingUsersRaw = await AsyncStorage.getItem(STORAGE_KEYS.ALL_USERS);
      if (!existingUsersRaw) {
        await AsyncStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(SEED_USERS));
      }
      const currentUserRaw = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (currentUserRaw) {
        setUser(JSON.parse(currentUserRaw));
      }
    } catch (e) {
      console.error('Error initializing app:', e);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const usersRaw = await AsyncStorage.getItem(STORAGE_KEYS.ALL_USERS);
    const users: StoredUser[] = usersRaw ? JSON.parse(usersRaw) : [];
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!found) throw new Error('Invalid email or password');
    const { password: _pw, ...userWithoutPassword } = found;
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userWithoutPassword));
    setUser(userWithoutPassword);
  }

  async function register(data: RegisterData) {
    const usersRaw = await AsyncStorage.getItem(STORAGE_KEYS.ALL_USERS);
    const users: StoredUser[] = usersRaw ? JSON.parse(usersRaw) : [];
    const exists = users.find(u => u.email.toLowerCase() === data.email.toLowerCase());
    if (exists) throw new Error('An account with this email already exists');
    const newUser: StoredUser = {
      id: generateId(),
      ...data,
      totalDonations: 0,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    await AsyncStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(users));
    const { password: _pw, ...userWithoutPassword } = newUser;
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userWithoutPassword));
    setUser(userWithoutPassword);
  }

  async function logout() {
    await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    setUser(null);
  }

  async function updateUser(updates: Partial<User>) {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
    setUser(updatedUser);
    const usersRaw = await AsyncStorage.getItem(STORAGE_KEYS.ALL_USERS);
    if (usersRaw) {
      const users: StoredUser[] = JSON.parse(usersRaw);
      const idx = users.findIndex(u => u.id === user.id);
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...updates };
        await AsyncStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(users));
      }
    }
  }

  const value = useMemo(() => ({ user, isLoading, login, register, logout, updateUser }), [user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
