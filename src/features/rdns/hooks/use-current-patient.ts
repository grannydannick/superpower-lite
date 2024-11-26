import { useQueryClient } from '@tanstack/react-query';

import { usePatientStore } from '@/features/rdns/stores/patient-store';
import { ROLES, useAuthorization } from '@/lib/authorization';
import { TypeformWebhook, User } from '@/types/api';

type UseCurrentPatientProps = {
  fullPatientName: string;
  hasAllowedRole: boolean;
  selectedPatient: User | undefined;
  typeforms: TypeformWebhook[] | undefined;
  setPatient: (patient: User) => void;
  removePatient: () => void;
};

/**
 * Custom hook to manage patient switching logic.
 *
 * @param {Function} [onSelectCallback] - Optional callback to execute after a patient is selected.
 * @returns {UseCurrentPatientProps} - An object containing patient selection logic and data.
 */
export const useCurrentPatient = (
  onSelectCallback?: () => void,
): UseCurrentPatientProps => {
  const { checkAccess } = useAuthorization();
  const queryClient = useQueryClient();

  const hasAllowedRole = checkAccess({ allowedRoles: [ROLES.RDN_CLINICIAN] });

  const selectedPatient = usePatientStore((state) => state.selectedPatient);
  const setPatientInStore = usePatientStore((state) => state.setPatient);
  const removePatientFromStore = usePatientStore(
    (state) => state.removePatient,
  );

  const fullPatientName = selectedPatient
    ? `${selectedPatient.firstName} ${selectedPatient.lastName}`
    : 'Select member';

  const typeforms = selectedPatient ? selectedPatient.typeforms : [];

  /**
   * Handler for selecting a patient.
   *
   * @param {User} patient - The patient object to select.
   */
  const setPatient = (patient: User) => {
    if (patient.id === selectedPatient?.id) {
      console.warn('This patient is already selected');
      return;
    }

    setPatientInStore(patient);
    queryClient.refetchQueries();

    if (onSelectCallback && typeof onSelectCallback === 'function') {
      onSelectCallback();
    }
  };

  const removePatient = () => {
    removePatientFromStore();
    queryClient.refetchQueries();
  };

  return {
    fullPatientName,
    hasAllowedRole,
    selectedPatient,
    typeforms,
    setPatient,
    removePatient,
  };
};
