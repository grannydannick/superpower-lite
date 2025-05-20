import { useState } from 'react';

import { useEditAddress } from '@/features/users/api';
import { useUser } from '@/lib/auth';
import { Address } from '@/types/api';

export function useAddressManagement() {
  const { data: user } = useUser();
  const editUserAddressMutation = useEditAddress();

  const [selectedAddressId, setSelectedAddressId] = useState<
    string | undefined
  >(user?.primaryAddress?.id);

  const setDefaultAddress = async (address: Address) => {
    setSelectedAddressId(address.id);
    await editUserAddressMutation.mutateAsync({
      data: {
        ...address,
        use: 'home',
      },
      id: address.id,
    });
  };

  return {
    selectedAddressId,
    setDefaultAddress,
    addresses: user?.address || [],
    primaryAddressId: user?.primaryAddress?.id,
  };
}
