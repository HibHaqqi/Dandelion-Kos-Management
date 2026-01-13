export type Customer = {
  id: string;
  name: string;
  entryDate: string;
  phone: string;
  nik: string;
  roomNumber?: string;
  lastPayment?: string;
  checkoutDate?: string | null;
  lastPaymentDate?: string | null;
};

export type Room = {
  id: string;
  roomNumber: string;
  status: string;
  lastPayment: string | null;
};

export type Transaction = {
  id:string;
  type: 'revenue' | 'expense';
  amount: number;
  date: string;
  description: string;
  category?: string;
  roomNumber?: string;
  customerName?: string;
  status?: string;
  receiptUrl?: string | null;
  isVerified?: boolean;
  rejectionReason?: string | null;
};

export type Category = {
  id: string;
  name: string;
  type: 'expense' | 'revenue';
  createdAt: string;
  updatedAt: string;
};
