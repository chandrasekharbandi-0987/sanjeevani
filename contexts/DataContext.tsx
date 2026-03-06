import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth, BloodGroup, User } from './AuthContext';

export type UrgencyLevel = 'critical' | 'high' | 'medium' | 'low';
export type RequestStatus = 'pending' | 'accepted' | 'doctor_approved' | 'completed' | 'cancelled';

export interface BloodRequest {
  id: string;
  recipientId: string;
  recipientName: string;
  bloodGroup: BloodGroup;
  hospital: string;
  urgencyLevel: UrgencyLevel;
  location: string;
  contactNumber: string;
  doctorApproval: boolean;
  status: RequestStatus;
  acceptedByDonorId?: string;
  acceptedByDonorName?: string;
  doctorId?: string;
  doctorName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Donation {
  id: string;
  donorId: string;
  donorName: string;
  bloodGroup: BloodGroup;
  hospital: string;
  donationDate: string;
  status: 'completed' | 'scheduled';
  requestId?: string;
  recipientName?: string;
  livesImpacted?: number;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'request' | 'accepted' | 'approved' | 'completed' | 'general';
  read: boolean;
  createdAt: string;
  relatedId?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participantNames: string[];
  lastMessage?: string;
  lastMessageTime?: string;
  relatedRequestId?: string;
}

interface DataContextValue {
  requests: BloodRequest[];
  donations: Donation[];
  notifications: Notification[];
  messages: Message[];
  conversations: Conversation[];
  donors: User[];
  allUsers: User[];
  unreadNotifications: number;
  createRequest: (data: Omit<BloodRequest, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'doctorApproval'>) => Promise<void>;
  acceptRequest: (requestId: string) => Promise<void>;
  declineRequest: (requestId: string) => Promise<void>;
  approveRequest: (requestId: string) => Promise<void>;
  completeRequest: (requestId: string) => Promise<void>;
  markNotificationRead: (notificationId: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  sendMessage: (conversationId: string, receiverId: string, receiverName: string, text: string) => Promise<void>;
  getOrCreateConversation: (otherUserId: string, otherUserName: string, requestId?: string) => Promise<string>;
  getMessagesForConversation: (conversationId: string) => Message[];
  refreshData: () => Promise<void>;
  approveDoctor: (userId: string) => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

const STORAGE_KEYS = {
  REQUESTS: 'sanjeevani_requests',
  DONATIONS: 'sanjeevani_donations',
  NOTIFICATIONS: 'sanjeevani_notifications',
  MESSAGES: 'sanjeevani_messages',
  CONVERSATIONS: 'sanjeevani_conversations',
  ALL_USERS: 'sanjeevani_all_users',
};

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

const SEED_REQUESTS: BloodRequest[] = [
  {
    id: 'req-1',
    recipientId: 'recipient-1',
    recipientName: 'Meera Joshi',
    bloodGroup: 'O+',
    hospital: 'Apollo Hospital',
    urgencyLevel: 'critical',
    location: 'Mumbai, Maharashtra',
    contactNumber: '9876543000',
    doctorApproval: false,
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'req-2',
    recipientId: 'recipient-1',
    recipientName: 'Suresh Kumar',
    bloodGroup: 'B+',
    hospital: 'Lilavati Hospital',
    urgencyLevel: 'high',
    location: 'Mumbai, Maharashtra',
    contactNumber: '9876543001',
    doctorApproval: false,
    status: 'pending',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
];

const SEED_DONATIONS: Donation[] = [
  {
    id: 'don-1',
    donorId: 'donor-1',
    donorName: 'Rahul Sharma',
    bloodGroup: 'B+',
    hospital: 'KEM Hospital',
    donationDate: '2024-09-15',
    status: 'completed',
    recipientName: 'Anonymous',
    livesImpacted: 3,
  },
  {
    id: 'don-2',
    donorId: 'donor-1',
    donorName: 'Rahul Sharma',
    bloodGroup: 'B+',
    hospital: 'Hinduja Hospital',
    donationDate: '2024-06-10',
    status: 'completed',
    recipientName: 'Anonymous',
    livesImpacted: 3,
  },
];

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    loadData();
  }, [user]);

  async function loadData() {
    await Promise.all([
      loadRequests(),
      loadDonations(),
      loadNotifications(),
      loadMessages(),
      loadConversations(),
      loadUsers(),
    ]);
  }

  async function loadRequests() {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.REQUESTS);
    if (raw) {
      setRequests(JSON.parse(raw));
    } else {
      await AsyncStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(SEED_REQUESTS));
      setRequests(SEED_REQUESTS);
    }
  }

  async function loadDonations() {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.DONATIONS);
    if (raw) {
      setDonations(JSON.parse(raw));
    } else {
      await AsyncStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(SEED_DONATIONS));
      setDonations(SEED_DONATIONS);
    }
  }

  async function loadNotifications() {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (raw) setNotifications(JSON.parse(raw));
  }

  async function loadMessages() {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGES);
    if (raw) setMessages(JSON.parse(raw));
  }

  async function loadConversations() {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    if (raw) setConversations(JSON.parse(raw));
  }

  async function loadUsers() {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.ALL_USERS);
    if (raw) {
      const stored = JSON.parse(raw);
      const usersWithoutPassword = stored.map(({ password: _pw, ...u }: any) => u);
      setAllUsers(usersWithoutPassword);
    }
  }

  async function saveRequests(updated: BloodRequest[]) {
    await AsyncStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(updated));
    setRequests(updated);
  }

  async function saveDonations(updated: Donation[]) {
    await AsyncStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(updated));
    setDonations(updated);
  }

  async function saveNotifications(updated: Notification[]) {
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
    setNotifications(updated);
  }

  async function saveMessages(updated: Message[]) {
    await AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(updated));
    setMessages(updated);
  }

  async function saveConversations(updated: Conversation[]) {
    await AsyncStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(updated));
    setConversations(updated);
  }

  async function addNotification(userId: string, message: string, type: Notification['type'], relatedId?: string) {
    const notif: Notification = {
      id: generateId(),
      userId,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
      relatedId,
    };
    const updated = [notif, ...notifications];
    await saveNotifications(updated);
  }

  async function createRequest(data: Omit<BloodRequest, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'doctorApproval'>) {
    const newRequest: BloodRequest = {
      ...data,
      id: generateId(),
      status: 'pending',
      doctorApproval: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newRequest, ...requests];
    await saveRequests(updated);
    const matchingDonors = allUsers.filter(u =>
      u.role === 'donor' && u.availability && (u.bloodGroup === data.bloodGroup || data.bloodGroup === 'O-')
    );
    for (const donor of matchingDonors.slice(0, 5)) {
      await addNotification(
        donor.id,
        `Emergency ${data.bloodGroup} blood needed at ${data.hospital}. Please help!`,
        'request',
        newRequest.id
      );
    }
  }

  async function acceptRequest(requestId: string) {
    if (!user) return;
    const updated = requests.map(r =>
      r.id === requestId
        ? { ...r, status: 'accepted' as RequestStatus, acceptedByDonorId: user.id, acceptedByDonorName: user.name, updatedAt: new Date().toISOString() }
        : r
    );
    await saveRequests(updated);
    const req = requests.find(r => r.id === requestId);
    if (req) {
      await addNotification(req.recipientId, `${user.name} has accepted your blood request. Contact: ${user.phone}`, 'accepted', requestId);
      const doctors = allUsers.filter(u => u.role === 'doctor');
      for (const doc of doctors) {
        await addNotification(doc.id, `Blood request at ${req.hospital} accepted by donor. Awaiting your approval.`, 'request', requestId);
      }
    }
  }

  async function declineRequest(requestId: string) {
    const updated = requests.map(r =>
      r.id === requestId ? { ...r, status: 'cancelled' as RequestStatus, updatedAt: new Date().toISOString() } : r
    );
    await saveRequests(updated);
  }

  async function approveRequest(requestId: string) {
    if (!user) return;
    const updated = requests.map(r =>
      r.id === requestId
        ? { ...r, doctorApproval: true, status: 'doctor_approved' as RequestStatus, doctorId: user.id, doctorName: user.name, updatedAt: new Date().toISOString() }
        : r
    );
    await saveRequests(updated);
    const req = requests.find(r => r.id === requestId);
    if (req) {
      await addNotification(req.recipientId, `Dr. ${user.name} has approved your blood request!`, 'approved', requestId);
      if (req.acceptedByDonorId) {
        await addNotification(req.acceptedByDonorId, `Your donation for ${req.hospital} has been medically approved by Dr. ${user.name}.`, 'approved', requestId);
      }
    }
  }

  async function completeRequest(requestId: string) {
    if (!user) return;
    const req = requests.find(r => r.id === requestId);
    if (!req || !req.acceptedByDonorId) return;
    const updated = requests.map(r =>
      r.id === requestId ? { ...r, status: 'completed' as RequestStatus, updatedAt: new Date().toISOString() } : r
    );
    await saveRequests(updated);
    const newDonation: Donation = {
      id: generateId(),
      donorId: req.acceptedByDonorId,
      donorName: req.acceptedByDonorName || '',
      bloodGroup: req.bloodGroup,
      hospital: req.hospital,
      donationDate: new Date().toISOString().split('T')[0],
      status: 'completed',
      requestId: req.id,
      recipientName: req.recipientName,
      livesImpacted: 3,
    };
    await saveDonations([newDonation, ...donations]);
    await addNotification(req.recipientId, 'Your blood request has been fulfilled. Thank you!', 'completed', requestId);
    if (req.acceptedByDonorId) {
      await addNotification(req.acceptedByDonorId, `Thank you for your donation at ${req.hospital}! You may have saved up to 3 lives.`, 'completed', requestId);
    }
  }

  async function markNotificationRead(notificationId: string) {
    const updated = notifications.map(n => n.id === notificationId ? { ...n, read: true } : n);
    await saveNotifications(updated);
  }

  async function markAllNotificationsRead() {
    const updated = notifications.map(n => ({ ...n, read: true }));
    await saveNotifications(updated);
  }

  async function getOrCreateConversation(otherUserId: string, otherUserName: string, requestId?: string): Promise<string> {
    if (!user) return '';
    const existing = conversations.find(c =>
      c.participantIds.includes(user.id) && c.participantIds.includes(otherUserId)
    );
    if (existing) return existing.id;
    const newConv: Conversation = {
      id: generateId(),
      participantIds: [user.id, otherUserId],
      participantNames: [user.name, otherUserName],
      relatedRequestId: requestId,
    };
    const updated = [newConv, ...conversations];
    await saveConversations(updated);
    return newConv.id;
  }

  async function sendMessage(conversationId: string, receiverId: string, receiverName: string, text: string) {
    if (!user) return;
    const newMsg: Message = {
      id: generateId(),
      conversationId,
      senderId: user.id,
      senderName: user.name,
      receiverId,
      text,
      timestamp: new Date().toISOString(),
      read: false,
    };
    const updatedMessages = [...messages, newMsg];
    await saveMessages(updatedMessages);
    const updatedConversations = conversations.map(c =>
      c.id === conversationId
        ? { ...c, lastMessage: text, lastMessageTime: newMsg.timestamp }
        : c
    );
    await saveConversations(updatedConversations);
  }

  function getMessagesForConversation(conversationId: string): Message[] {
    return messages.filter(m => m.conversationId === conversationId);
  }

  async function approveDoctor(userId: string) {
    await loadUsers();
  }

  const donors = useMemo(() => allUsers.filter(u => u.role === 'donor'), [allUsers]);
  const unreadNotifications = useMemo(
    () => notifications.filter(n => n.userId === user?.id && !n.read).length,
    [notifications, user]
  );

  const userNotifications = useMemo(
    () => notifications.filter(n => n.userId === user?.id),
    [notifications, user]
  );

  const value = useMemo(() => ({
    requests,
    donations,
    notifications: userNotifications,
    messages,
    conversations,
    donors,
    allUsers,
    unreadNotifications,
    createRequest,
    acceptRequest,
    declineRequest,
    approveRequest,
    completeRequest,
    markNotificationRead,
    markAllNotificationsRead,
    sendMessage,
    getOrCreateConversation,
    getMessagesForConversation,
    refreshData: loadData,
    approveDoctor,
  }), [requests, donations, userNotifications, messages, conversations, donors, allUsers, unreadNotifications]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}
