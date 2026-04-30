import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

import { useFiles } from '@/features/files/api/get-files';
import { wearablesQuery } from '@/features/homepage/api/queries';
import { useActionDismissState } from '@/hooks/use-action-dismiss-state';
import { useUser } from '@/lib/auth';
import {
  CONNECT_WEARABLES_DISMISSED_AT_STORAGE_KEY,
  IMPORT_MEMORY_DISMISSED_AT_STORAGE_KEY,
  UPLOAD_LABS_DISMISSED_AT_STORAGE_KEY,
  shouldShowImportMemory,
} from '@/utils/show-action-conditions';

export interface SetupActionState {
  visible: boolean;
  dismiss: () => void;
  onClick: () => void;
}

export interface SetupActionsState {
  uploadLabs: SetupActionState;
  connectWearables: SetupActionState;
  importMemory: SetupActionState;
}

export const useSetupActions = (): SetupActionsState => {
  const navigate = useNavigate();
  const filesQuery = useFiles();
  const wearablesQueryResult = useQuery(wearablesQuery());
  const { data: user } = useUser();

  const uploadLabsDismiss = useActionDismissState(
    UPLOAD_LABS_DISMISSED_AT_STORAGE_KEY,
  );
  const connectWearablesDismiss = useActionDismissState(
    CONNECT_WEARABLES_DISMISSED_AT_STORAGE_KEY,
  );
  const importMemoryDismiss = useActionDismissState(
    IMPORT_MEMORY_DISMISSED_AT_STORAGE_KEY,
  );

  const hasUploadedPastLabs =
    filesQuery.isSuccess && filesQuery.data.files.length > 0;

  let hasConnectedWearable = false;
  for (const wearable of wearablesQueryResult.data?.wearables ?? []) {
    if (wearable.status === 'connected') {
      hasConnectedWearable = true;
      break;
    }
  }

  return {
    uploadLabs: {
      visible: !hasUploadedPastLabs && !uploadLabsDismiss.isDismissed,
      dismiss: uploadLabsDismiss.dismiss,
      onClick: () => {
        void navigate({
          to: '/concierge',
          search: { preset: 'upload-labs' },
        });
      },
    },
    connectWearables: {
      visible:
        wearablesQueryResult.isSuccess &&
        !hasConnectedWearable &&
        !connectWearablesDismiss.isDismissed,
      dismiss: connectWearablesDismiss.dismiss,
      onClick: () => {
        void navigate({
          to: '/settings',
          search: { tab: 'integrations' },
        });
      },
    },
    importMemory: {
      visible:
        shouldShowImportMemory(user?.createdAt) &&
        !importMemoryDismiss.isDismissed,
      dismiss: importMemoryDismiss.dismiss,
      onClick: () => {
        void navigate({
          to: '/concierge',
          search: { preset: 'import-memory' },
        });
      },
    },
  };
};
