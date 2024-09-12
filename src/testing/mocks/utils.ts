import { delay } from 'msw';

import { db, persistDb } from './db';

export type JWTPayload = {
  sub?: string; // Subject (e.g., user ID)
  login_id: string; // Custom claim (e.g., login ID)
  exp?: number; // Expiration time (in seconds since the epoch)
  iat?: number; // Issued at time (in seconds since the epoch)
  username?: string; // Username (or any other custom claims)
  [key: string]: any; // Allow other custom claims
};

// Encoding function that converts the object to base64
export const encode = (obj: any) => {
  const btoa =
    typeof window === 'undefined'
      ? (str: string) => Buffer.from(str, 'binary').toString('base64')
      : window.btoa;
  return btoa(JSON.stringify(obj));
};

// Decoding function that converts the base64 string back to an object
export const decode = (str: string) => {
  const atob =
    typeof window === 'undefined'
      ? (str: string) => Buffer.from(str, 'base64').toString('binary')
      : window.atob;
  return JSON.parse(atob(str));
};

// Mock JWT Signing Function using encode
export async function mockGenerateJwt(
  exp: string,
  claims: JWTPayload,
  secret: string, // secret is a string, not Uint8Array anymore
): Promise<string> {
  // Step 1: Create JWT header
  const header = {
    alg: 'HS256', // Algorithm
    typ: 'JWT', // Token type
  };

  // Step 2: Set issued at and expiration times in the claims
  const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
  claims.iat = currentTime;
  claims.exp = currentTime + parseExpiration(exp); // Parse the expiration

  // Step 3: Encode header and claims (payload)
  const encodedHeader = encode(header);
  const encodedPayload = encode(claims);

  // Step 4: Simulate the signature
  const signature = encode({ secret }); // You can use anything to simulate a "signature"

  // Step 5: Combine all parts to create the JWT
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// Helper function to parse the expiration time, e.g., '1h', '2w'
function parseExpiration(exp: string): number {
  const duration = parseInt(exp.slice(0, -1), 10);
  const unit = exp.slice(-1);
  switch (unit) {
    case 'h':
      return duration * 60 * 60; // hours to seconds
    case 'w':
      return duration * 7 * 24 * 60 * 60; // weeks to seconds
    default:
      throw new Error('Invalid expiration unit');
  }
}

// Mock verify function to check the integrity and expiration of the token
export async function mockVerifyJwt(
  token: string,
  secret: string,
): Promise<JWTPayload> {
  // Step 1: Split the token into parts
  const [encodedHeader, encodedPayload, encodedSignature] = token.split('.');

  if (!encodedHeader || !encodedPayload || !encodedSignature) {
    throw new Error('Invalid token format');
  }

  // Step 2: Decode the header and payload
  const header = decode(encodedHeader);
  const payload = decode(encodedPayload);

  // Step 3: Verify the header is what we expect
  if (header.alg !== 'HS256' || header.typ !== 'JWT') {
    throw new Error('Invalid token header');
  }

  // Step 4: Verify the expiration time (exp) and issued at (iat) time
  const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
  if (payload.exp && currentTime > payload.exp) {
    throw new Error('Token has expired');
  }

  if (payload.iat && currentTime < payload.iat) {
    throw new Error('Token issued in the future');
  }

  // Step 5: Verify the signature
  const expectedSignature = encode({ secret }); // Generate the "mock" signature
  if (encodedSignature !== expectedSignature) {
    throw new Error('Invalid token signature');
  }

  // Step 6: If everything is valid, return the decoded payload
  return payload;
}

export const hash = (str: string) => {
  let hash = 5381,
    i = str.length;

  while (i) {
    hash = (hash * 33) ^ str.charCodeAt(--i);
  }
  return String(hash >>> 0);
};

export const networkDelay = () => {
  const delayTime = import.meta.env.TEST
    ? 200
    : Math.floor(Math.random() * 700) + 300;
  return delay(delayTime);
};

const omit = <T extends object>(obj: T, keys: string[]): T => {
  const result = {} as T;
  for (const key in obj) {
    if (!keys.includes(key)) {
      result[key] = obj[key];
    }
  }

  return result;
};

export const sanitizeUser = <O extends object>(user: O) =>
  omit<O>(user, ['password', 'iat']);

export async function authenticate({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const user = db.user.findFirst({
    where: {
      email: {
        equals: email,
      },
    },
  });

  if (user?.password === hash(password)) {
    const sanitizedUser = sanitizeUser(user);

    const login = db.login.create({
      userId: user.id,
    });

    await persistDb('login');

    return { user: sanitizedUser, login };
  }

  const error = new Error('Invalid username or password');
  throw error;
}

export async function getAuthTokens({
  id,
  userId,
}: {
  id: string;
  userId: string;
}) {
  const accessToken = await mockGenerateJwt(
    '1h',
    {
      login_id: id,
      sub: userId,
      username: userId,
    },
    ACCESS_SECRET,
  );

  const refreshToken = await mockGenerateJwt(
    '2w',
    {
      login_id: id,
      refresh_secret: REFRESH_SECRET,
    },
    REFRESH_SECRET,
  );

  return { accessToken, refreshToken };
}

// Directly creating Uint8Array from byte values for the secrets
export const ACCESS_SECRET = 'access_react_app_token';

export const REFRESH_SECRET = 'refresh_react_app_token';

export async function requireAuth(token?: string) {
  if (!token) {
    return { error: 'Unauthorized', user: null };
  }

  try {
    const payload = await mockVerifyJwt(token, ACCESS_SECRET);

    const user = db.user.findFirst({
      where: {
        id: {
          equals: payload.username as string,
        },
      },
    });

    if (!user) {
      return { error: 'Unauthorized', user: null };
    }

    const login = db.login.findFirst({
      where: {
        id: {
          equals: payload.login_id as string,
        },
      },
    });

    if (!login) {
      return { error: 'Unauthorized', user: null };
    }

    return { user: sanitizeUser(user), login };
  } catch (err: any) {
    return { error: 'Unauthorized', user: null };
  }
}

export function requireAdmin(user: any) {
  if (user.role !== 'ADMIN') {
    throw Error('Unauthorized');
  }
}
