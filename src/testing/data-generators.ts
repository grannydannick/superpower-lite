import {
  randUserName,
  randEmail,
  randUuid,
  randPassword,
  randPhoneNumber,
  randPastDate,
} from '@ngneat/falso';

const generateUser = () => ({
  id: randUuid() + Math.random(),
  firstName: randUserName({ withAccents: false }),
  lastName: randUserName({ withAccents: false }),
  email: randEmail(),
  password: randPassword(),
  phone: randPhoneNumber({ countryCode: 'US' }),
  gender: 'MALE',
  dateOfBirth: randPastDate({ years: 20 }),
  admin: true,
});

export const createUser = <T extends Partial<ReturnType<typeof generateUser>>>(
  overrides?: T,
) => {
  return { ...generateUser(), ...overrides };
};
