import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Funciones de encriptación para el passkey
export const encryptKey = (passkey: string): string => {
  return btoa(passkey);
};

export const decryptKey = (passkey: string): string => {
  return atob(passkey);
};
