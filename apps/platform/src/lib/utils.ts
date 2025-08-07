import {  clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { authClient } from './auth-client';
import type {ClassValue} from 'clsx';

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
    ipAddress: string;
    userAgent: string;
    userId: string;
    id: string;
    isSubscribed: boolean;
  };
  user: {
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    createdAt: Date;
    updatedAt: Date;
    username: string;
    displayUsername: string;
    phoneNumber: string;
    phoneNumberVerified: boolean;
    id: string;
    isSubscribed: boolean;
  };
}

const getSession = async (): Promise<ISession | null> => {
  const { data: session } = await authClient.getSession()

  return session ?? null
}
export const session = await getSession()

const getSubscription = async () => {
  const session = await getSession()

  return session?.user.isSubscribed
}
export const isSubscribed = await getSubscription()

const EmailVerified = async () => {
  const session = await getSession()

  return session?.user.emailVerified
}
export const isEmailVerified = await EmailVerified()

const Authenticated = async () => {
  const session = await getSession()

  return session !== null
}

export const isAuthenticated = await Authenticated()

