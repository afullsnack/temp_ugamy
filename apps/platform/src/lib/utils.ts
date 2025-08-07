import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { authClient } from './auth-client';
import type { ClassValue } from 'clsx';

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | undefined): string {
  const day = date ? date.getDate().toString().padStart(2, '0') : '00';
  const month = date ? (date.getMonth() + 1).toString().padStart(2, '0') : '00';
  const year = date ? date.getFullYear() : "0000"

  return `${day}/${month}/${year}`;
}
export interface ISession {
  session: {
    expiresAt: Date;
    token: string;
    createdAt: Date;
    updatedAt: Date;
    ipAddress?: string | null | undefined;
    userAgent?: string | null | undefined;
    userId: string;
    id: string;
    isSubscribed?: boolean;
  };
  user: {
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string | null | undefined;
    createdAt: Date;
    updatedAt: Date;
    username?: string | null | undefined;
    displayUsername?: string | null | undefined;
    phoneNumber?: string | null | undefined;
    phoneNumberVerified?: boolean | null | undefined;
    id: string;
    isSubscribed?: boolean;
  };
}

let session: ISession | null = null;
let isSubscribed = false;
let isEmailVerified = false;
let isAuthenticated = false;

const initializeValues = async () => {
  const { data: sessionData } = await authClient.getSession();
  session = sessionData ?? null;
  isSubscribed = session?.user.isSubscribed ?? false;
  isEmailVerified = session?.user.emailVerified ?? false;
  isAuthenticated = session !== null;
}

initializeValues();

export { session, isSubscribed, isEmailVerified, isAuthenticated };
