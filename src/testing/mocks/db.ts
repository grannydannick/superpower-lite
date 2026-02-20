import { factory, primaryKey } from '@mswjs/data';
import { nanoid } from 'nanoid';

const models = {
  user: {
    id: primaryKey(nanoid),
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    dateOfBirth: String,
    gender: String,
    password: String,
    role: Array,
  },
  login: { id: primaryKey(nanoid), userId: String, revoked: Boolean },
  otpCode: {
    id: primaryKey(nanoid),
    userId: String,
    validated: Boolean,
    code: String,
    createdAt: Date.now,
  },
  consult: { id: primaryKey(nanoid), name: String, practitioner: String },
  message: { id: primaryKey(nanoid), body: String, userId: String },
};

export const db = factory(models);

export type Model = keyof typeof models;

export const loadDb = async () => {
  return Object.assign(
    JSON.parse(window.localStorage.getItem('msw-db') || '{}'),
  );
};

export const storeDb = async (data: string) => {
  window.localStorage.setItem('msw-db', data);
};

export const persistDb = async (model: Model) => {
  if (import.meta.env.TEST) return;
  const data = await loadDb();
  data[model] = db[model].getAll();
  await storeDb(JSON.stringify(data));
};

export const initializeDb = async () => {
  const database = await loadDb();
  Object.entries(db).forEach(([key, model]) => {
    const dataEntres = database[key];
    if (dataEntres) {
      dataEntres?.forEach((entry: Record<string, any>) => {
        model.create(entry);
      });
    }
  });
};

export const resetDb = () => {
  window.localStorage.clear();
};
