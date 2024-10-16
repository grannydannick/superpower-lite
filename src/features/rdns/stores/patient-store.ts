import create from 'zustand';

import { getLocalStorageObject, setLocalStorageObject } from '@/lib/utils';
import { User } from '@/types/api';

type PatientState = {
  selectedPatient: User | undefined;
  setPatient: (patient: User) => void;
  removePatient: () => void;
};

const STORE_KEY = 'patient';

export const usePatientStore = create<PatientState>((set) => ({
  selectedPatient: getLocalStorageObject<User>(STORE_KEY),
  setPatient: (patient: User) => {
    set(() => {
      setLocalStorageObject(STORE_KEY, patient);
      return { selectedPatient: patient };
    });
  },
  removePatient: () => {
    set(() => {
      localStorage.removeItem(STORE_KEY);
      return { selectedPatient: undefined };
    });
  },
}));
