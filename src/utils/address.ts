import { US_STATE_CODES } from '@/const/us-state-codes';
import { Address } from '@/types/api';

export const isAddressComplete = (address: Address): boolean => {
  return (
    address &&
    Boolean(address.line) &&
    address.line.length > 0 &&
    addressLineValid(address.line[0], true) &&
    Boolean(address.city) &&
    cityValid(address.city) &&
    Boolean(address.state) &&
    stateValid(address.state) &&
    Boolean(address.postalCode) &&
    postalCodeValid(address.postalCode)
  );
};

export const cityValid = (city: string): boolean => {
  //Regex that allows all case alphanumeric input as well as hyphens and . does not allow all spaces or all special characters"
  const cityPattern = /^(?![-. ]+$)[a-zA-Z0-9 .-]+$/;
  return cityPattern.test(city);
};

export const addressLineValid = (line: string, isLineOne: boolean): boolean => {
  const linePattern = /^(?![-. ]*$)[a-zA-Z0-9 .-]*$/;
  return linePattern.test(line) && (!isLineOne || line.length > 0);
};

export const postalCodeValid = (postalCode: string): boolean => {
  const postalCodePattern = /^(\d{5})?$/;
  return postalCodePattern.test(postalCode);
};

export const stateValid = (state: string): boolean => {
  return US_STATE_CODES.includes(state);
};

export const getLine = (address: Address, index: number): string => {
  return address && address.line && address.line.length > index
    ? address.line[index]
    : '';
};

export const setLine = (
  address: Address,
  index: number,
  str: string,
): string[] => {
  const line: string[] = address?.line || [];
  while (line.length <= index) {
    line.push('');
  }
  line[index] = str;

  return line;
};
