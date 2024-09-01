import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { LoginState } from '@/types/api';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getLocalStorageObject<T>(key: string): T | undefined {
  const str = localStorage.getItem(key) || undefined;
  return str ? (JSON.parse(str) as T) : undefined;
}

export function setLocalStorageObject<T>(key: string, value: T): void {
  value
    ? localStorage.setItem(key, stringify(value))
    : localStorage.removeItem(key);
}

/**
 * Returns true if the value is empty (null, undefined, empty string, or empty object).
 * @param v Any value.
 * @returns True if the value is an empty string or an empty object.
 */
export function isEmpty(v: any): boolean {
  if (v === null || v === undefined) {
    return true;
  }
  const t = typeof v;
  return (
    (t === 'string' && v === '') ||
    (t === 'object' && Object.keys(v).length === 0)
  );
}

/**
 * FHIR JSON stringify.
 * Removes properties with empty string values.
 * Removes objects with zero properties.
 * See: https://www.hl7.org/fhir/json.html
 * @param value The input value.
 * @param pretty Optional flag to pretty-print the JSON.
 * @returns The resulting JSON string.
 */
export function stringify(value: any, pretty?: boolean): string {
  return JSON.stringify(value, stringifyReplacer, pretty ? 2 : undefined);
}

export const setActiveLogin = (login: LoginState) => {
  clearActiveLogin();
  setLocalStorageObject('activeLogin', login);
};

/**
 * Clears the active login from local storage.
 * Does not clear all local storage (such as other logins).
 */
export const clearActiveLogin = () => {
  localStorage.removeItem('activeLogin');
};

export const getActiveLogin = (): LoginState | null => {
  return getLocalStorageObject<LoginState>('activeLogin') ?? null;
};

/**
 * Returns true if the key is an array key.
 * @param k The property key.
 * @returns True if the key is an array key.
 */
function isArrayKey(k: string): boolean {
  return !!k.match(/\d+$/);
}

/**
 * Evaluates JSON key/value pairs for FHIR JSON stringify.
 * Removes properties with empty string values.
 * Removes objects with zero properties.
 * @param {string} k Property key.
 * @param {*} v Property value.
 */
function stringifyReplacer(k: string, v: any): any {
  return !isArrayKey(k) && isEmpty(v) ? undefined : v;
}
