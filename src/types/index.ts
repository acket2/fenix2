export type Role = 'admin' | 'user';

export interface User {
  id: string;
  login: string;
  password?: string;
  role: Role;
}

export interface RegistrationRequest {
  id: string;
  login: string;
  password?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
}

export interface Note {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: number;
  tabId?: string;
  imageUrl?: string;
}

export interface StatItem {
  id: string;
  label: string;
  value: string;
  trend: string;
  trendColor: string;
}

export interface ProjectFile {
  id: string;
  name: string;
  url: string;
  uploadedAt: number;
}

export interface TableObject {
  id: string;
  name: string;
  customer: string;
  contractAmount: number;
  costAmount: number;
  closingAmount: number;
  isCompleted: boolean;
  progress?: number;
  color?: string;
  files?: ProjectFile[];
}

export interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
}

export type DayStatus = 'full' | 'half' | 'absent' | 'none';

export interface FotRecord {
  id: string;
  workerName: string;
  year: number;
  month: number;
  days: Record<number, DayStatus>;
  dayAmounts?: Record<number, number>;
  paidFridays: Record<number, boolean>;
  paidAmount: number;
  bonusAmount?: number;
  dailyRate?: number;
  isBonusPaid?: boolean;
}

export interface ActiveObject {
  id: string;
  name: string;
  progress: number;
  color: string;
}
