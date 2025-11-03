export interface User {
  id: number;
  email: string;
  password_hash: string;
  full_name: string;
  referral_code: string;
  referred_by?: number;
  role: 'user' | 'admin';
  created_at: Date;
  updated_at: Date;
}

export interface Transaction {
  id: number;
  user_id: number;
  amount: number;
  type: 'earn' | 'spend' | 'expire' | 'admin_award' | 'referral';
  description: string;
  expires_at?: Date;
  expired: boolean;
  created_at: Date;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  type: 'discount' | 'service' | 'physical';
  active: boolean;
  created_at: Date;
}

export interface Order {
  id: number;
  user_id: number;
  product_id: number;
  coins_spent: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: Date;
}

export interface Referral {
  id: number;
  referrer_id: number;
  referred_id: number;
  reward_amount: number;
  created_at: Date;
}

export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
}
