# oRPC API Client and Generated Types

This document describes how to use the OpenAPI-generated types and the `$api` client for making type-safe API calls to the ts-server backend.

## Overview

- **Types file**: `@/orpc/types.generated` - Auto-generated from backend oRPC routes
- **API client**: `@/orpc/client` - Exports `api` (fetch client) and `$api` (React Query client)
- **Pattern**: Use `$api.queryOptions()` for React Query integration

## Type Extraction

Extract types from the generated `operations` interface:

```typescript
import type { operations } from '@/orpc/types.generated';

// Extract response type from a specific operation
type GetAllProtocolsResponse =
  operations['protocol.getAllProtocols']['responses'][200]['content']['application/json'];

// Extract nested types from the response
export type Protocol = GetAllProtocolsResponse['protocols'][number];
export type Goal = Protocol['goals'][number];
export type Activity = Protocol['activities'][number];
```

**Pattern**: `operations['<namespace>.<method>']['responses'][<status>]['content']['application/json']`

## Using $api for Queries

### Basic Query

```typescript
import { useQuery } from '@tanstack/react-query';
import { $api } from '@/orpc/client';

export function useProtocols() {
  return useQuery({
    ...$api.queryOptions('get', '/protocol'),
    select: (data) => data.protocols,
  });
}
```

### Query with Path Parameters

```typescript
export function useProtocol(protocolId: string) {
  return useQuery({
    ...$api.queryOptions('get', '/protocol/:id', {
      params: {
        path: { id: protocolId },
      },
    }),
    enabled: !!protocolId,
    select: (data) => data.protocol,
  });
}
```

### Query with Query Parameters

```typescript
export function useAuthMethods(email: string) {
  return useQuery({
    ...$api.queryOptions('get', '/auth/methods', {
      params: {
        query: { email },
      },
    }),
    enabled: !!email,
  });
}
```

## Key Benefits

1. **Full Type Safety**: Types are auto-generated from backend Zod schemas
2. **Auto-completion**: IDE provides suggestions for paths and parameters
3. **Compile-time Errors**: TypeScript catches API mismatches before runtime
4. **Consistent Patterns**: Use the same pattern for all API calls

## Common Patterns

### Transforming Data with `select`

Use `select` to transform the response data:

```typescript
return useQuery({
  ...$api.queryOptions('get', '/protocol'),
  select: (data) => data.protocols[0] ?? null, // Return first item or null
});
```

### Conditional Queries with `enabled`

Prevent queries from running until conditions are met:

```typescript
return useQuery({
  ...$api.queryOptions('get', '/protocol/:id', {
    params: { path: { id: protocolId } },
  }),
  enabled: !!protocolId, // Only run when protocolId exists
});
```

### Custom Query Keys

By default, `$api.queryOptions` generates query keys automatically. Override if needed:

```typescript
return useQuery({
  ...$api.queryOptions('get', '/protocol'),
  queryKey: ['protocols', 'custom', 'key'], // Custom key
});
```

## Mutations

For POST/PUT/DELETE operations, use `$api.useMutation()`:

```typescript
import { useMutation } from '@tanstack/react-query';
import { $api } from '@/orpc/client';

export function useCreateCheckout() {
  return useMutation({
    ...$api.mutationOptions('post', '/checkout/create-checkout-session'),
  });
}
```

## Regenerating Types

When backend routes change, regenerate types:

```bash
# In react-app workspace
bun generate:orpc-types
```

## Troubleshooting Type Issues

### Step 1: Regenerate Types

If you encounter type errors or mismatches, the first step is to regenerate the types:

```bash
# In react-app workspace
bun generate:orpc-types
```

This command fetches the latest OpenAPI schema from the running ts-server and regenerates the TypeScript types.

### Step 2: Ensure ts-server is Running

If `bun generate:orpc-types` fails with a connection error, tell the user to ensure that ts-server is running and accessible at the expected URL. Do not try and start ts-server for them.

The type generation command needs ts-server to be running because it fetches the OpenAPI schema from the `/rpc/openapi.json` endpoint.

### Common Type Issues

1. **"Property does not exist on type"** → Run `bun generate:orpc-types`
2. **"Type is not assignable"** → Backend schema changed, regenerate types
3. **"Cannot find module '@/orpc/types.generated'"** → Run `bun generate:orpc-types`
4. **Connection refused during type generation** → Tell the user to ensure that ts-server is running and accessible at the expected URL.

## Anti-Patterns (Don't Do This)

❌ **Don't use raw fetch or axios**

```typescript
// BAD
const response = await fetch('/protocol');
```

❌ **Don't manually construct URLs**

```typescript
// BAD
const url = `${API_URL}/protocol/${id}`;
```

❌ **Don't hardcode response types**

```typescript
// BAD
type Protocol = { id: string; title: string }; // Will get out of sync
```

✅ **Do use the generated client and types**

```typescript
// GOOD
const { data } = useQuery({
  ...$api.queryOptions('get', '/protocol/:id', {
    params: { path: { id } },
  }),
});
```
