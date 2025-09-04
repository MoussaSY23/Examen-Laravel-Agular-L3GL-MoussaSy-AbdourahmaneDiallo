export interface User {
  id?: number;
  name: string;
  email: string;
  role: 'admin' | 'employee' | 'client';
  telephone?: string;
  adresse?: string;
  ville?: string;
  avatar?: string;
  created_at?: string;
  updated_at?: string;
  password?: string;
}