import { CollectionMethodType } from '@/types/api';

export type CollectionMethodsType = {
  name: string;
  value: CollectionMethodType;
  description: string;
  cancelationText?: string;
  price: number;
};
