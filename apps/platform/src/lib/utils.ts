import {  clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
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
