import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getData, saveData, STORAGE_KEYS } from '../services/storageService';

export const AddressContext = createContext();

export function AddressProvider({ children }) {
  const [addresses, setAddresses] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);

  const selectedAddress = useMemo(() => {
    return addresses.find(address => address.isSelected);
  }, [addresses]);

  useEffect(() => {
    const restoreAddresses = async () => {
      try {
        const savedAddresses = await getData(STORAGE_KEYS.ADDRESSES);

        if (Array.isArray(savedAddresses)) {
          setAddresses(savedAddresses);
        }
      } catch {
        console.log('Error while hydrating addresses');
      } finally {
        setIsHydrated(true);
      }
    };

    restoreAddresses();
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    saveData(STORAGE_KEYS.ADDRESSES, addresses);
  }, [addresses, isHydrated]);

  const addAddress = newAddress => {
    setAddresses(previousAddresses => {
      const updatedAddresses = previousAddresses.map(address => ({
        ...address,
        isSelected: false,
      }));

      return [
        ...updatedAddresses,
        {
          ...newAddress,
          id: Date.now().toString(),
          isSelected: true,
        },
      ];
    });
  };

  const selectAddress = selectedId => {
    setAddresses(previousAddresses =>
      previousAddresses.map(address => ({
        ...address,
        isSelected: address.id === selectedId,
      })),
    );
  };

  const deleteAddress = addressId => {
    setAddresses(previousAddresses => {
      const updatedAddresses = previousAddresses.filter(
        address => address.id !== addressId,
      );

      if (
        updatedAddresses.length > 0 &&
        !updatedAddresses.some(address => address.isSelected)
      ) {
        return updatedAddresses.map((address, index) => ({
          ...address,
          isSelected: index === 0,
        }));
      }

      return updatedAddresses;
    });
  };

  if (!isHydrated) {
    return null;
  }

  return (
    <AddressContext.Provider
      value={{
        addresses,
        selectedAddress,
        addAddress,
        selectAddress,
        deleteAddress,
      }}
    >
      {children}
    </AddressContext.Provider>
  );
}

export const useAddress = () => useContext(AddressContext);
