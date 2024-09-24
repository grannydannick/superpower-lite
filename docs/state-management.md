# 🗃️ State Management

Managing state effectively is crucial for optimizing your application's performance. Instead of storing all state information in a single centralized repository, consider dividing it into various categories based on their usage. By categorizing your state, you can streamline your state management process and enhance your application's overall efficiency.

## Component State

Component state is specific to individual components and should not be shared globally. It can be passed down to child components as props when necessary. Typically, you should begin by defining state within the component itself and consider elevating it to a higher level if it's required elsewhere in the application. When managing component state, you can use the following React hooks:

- [useState](https://react.dev/reference/react/useState) - for simpler states that are independent
- [useReducer](https://react.dev/reference/react/useReducer) - for more complex states where on a single action you want to update several pieces of state

[Component State Example Code](../src/components/layouts/content-layout.tsx)

## Application State

Application state manages global parts of an application, such as controlling global modals, notifications, and toggling color modes. To ensure optimal performance and ease of maintenance, it is advisable to localize the state as closely as possible to the components that require it. Avoid unnecessarily globalizing all state variables from the outset to maintain a structured and efficient state management architecture.

We use following State Solution:

- [zustand](https://github.com/pmndrs/zustand)

[Feature State Example Code](../src/features/onboarding/stores/onboarding-store.ts)

[Feature State With Initial Props Example Code](../src/features/orders/stores/order-store-creator.ts)

## Server Cache State

The Server Cache State refers to the data retrieved from the server that is stored locally on the client-side for future use. While it is feasible to cache remote data within a state management store like Redux, there exist more optimal solutions to this practice. It is essential to consider more efficient caching mechanisms to enhance performance and optimize data retrieval processes.

We use following Server Cache Library:

- [react-query](https://tanstack.com/query) - REST

[Server Cache State Example Code](../src/features/orders/api/get-orders.ts)

## Form State

Forms are a crucial part of any application, and managing form state effectively is essential for a seamless user experience. When handling form state, consider using libraries like Formik, React Hook Form, or Final Form to streamline the process. These libraries provide built-in validation, error handling, and form submission functionalities, making it easier to manage form state within your application.

Forms in React can be [controlled and uncontrolled](https://react.dev/learn/sharing-state-between-components#controlled-and-uncontrolled-components).

Depending on the application needs, they might be pretty complex with many different fields that require validation.

Although it is possible to build any form using only React primitives, we use:

- [React Hook Form](https://react-hook-form.com/)

We created abstracted `Form` component.

[Form Example Code](../src/components/ui/form.tsx)

We also integrated validation library with the mentioned solutions to validate inputs on the client:

- [zod](https://github.com/colinhacks/zod)

[Validation Example Code](../src/features/auth/components/register-form.tsx)

## URL State

URL state refers to the data stored and manipulated within the address bar of the browser. This state is commonly managed through URL parameters (e.g., /app/${dynamicParam}) or query parameters (e.g., /app?dynamicParam=1). By incorporating routing solutions like react-router-dom, you can effectively access and control the URL state, enabling dynamic manipulation of application parameters directly from the browser's address bar.

```ts
export const DiscussionView = ({ discussionId }: { discussionId: string }) => {
  const discussionQuery = useDiscussion({
    discussionId,
  });

  if (discussionQuery.isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const discussion = discussionQuery?.data?.data;

  if (!discussion) return null;

  return (
    <div>
      <span className="text-xs font-bold">
        {formatDate(discussion.createdAt)}
      </span>
      {discussion.author && (
        <span className="ml-2 text-sm font-bold">
          by {discussion.author.firstName} {discussion.author.lastName}
        </span>
      )}
      <div className="mt-6 flex flex-col space-y-16">
        <div className="flex justify-end">
          <UpdateDiscussion discussionId={discussionId} />
        </div>
        <div>
          <div className="overflow-hidden bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <div className="mt-1 max-w-2xl text-sm text-gray-500">
                <MDPreview value={discussion.body} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
```
