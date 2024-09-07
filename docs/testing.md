# 🧪 Testing

As highlighted in this [tweet](https://twitter.com/rauchg/status/807626710350839808), the efficacy of testing lies in the comprehensive coverage provided by integration and end-to-end (e2e) tests. While unit tests serve a purpose in isolating and validating individual components, the true value and confidence in application functionality stem from robust integration and e2e testing strategies.

## Types of tests:

### Unit Tests

Unit tests are the smallest tests you can write. They test individual parts of your application in isolation. They are useful for testing shared components and functions that are used throughout the entire application. They are also useful for testing complex logic in a single component. They are fast to run and easy to write.

[Unit Test Example Code](../src/lib/stepper/__tests__/stepper.test.tsx)

### Integration Tests

Integration testing checks how different parts of your application work together. It's crucial to focus on integration tests for most of your testing, as they provide significant benefits and boost confidence in your application's reliability. While unit tests are helpful for individual parts, passing them doesn't guarantee your app will function correctly if the connections between parts are flawed. Testing various features with integration tests is vital to ensure that your application works smoothly and consistently.

```ts
import {
  renderApp,
  screen,
  userEvent,
  waitFor,
  createDiscussion,
  createUser,
  within,
} from '@/testing/test-utils';

import { DiscussionRoute } from '../discussion';

const renderDiscussion = async () => {
  const fakeUser = await createUser();
  const fakeDiscussion = await createDiscussion({ teamId: fakeUser.teamId });

  const utils = await renderApp(<DiscussionRoute />, {
    user: fakeUser,
    path: `/app/discussions/:discussionId`,
    url: `/app/discussions/${fakeDiscussion.id}`,
  });

  await screen.findByText(fakeDiscussion.title);

  return {
    ...utils,
    fakeUser,
    fakeDiscussion,
  };
};

test('should render discussion', async () => {
  const { fakeDiscussion } = await renderDiscussion();
  expect(screen.getByText(fakeDiscussion.body)).toBeInTheDocument();
});

test('should update discussion', async () => {
  const { fakeDiscussion } = await renderDiscussion();

  const titleUpdate = '-Updated';
  const bodyUpdate = '-Updated';

  await userEvent.click(
    screen.getByRole('button', { name: /update discussion/i }),
  );

  const drawer = await screen.findByRole('dialog', {
    name: /update discussion/i,
  });

  const titleField = within(drawer).getByText(/title/i);
  const bodyField = within(drawer).getByText(/body/i);

  const newTitle = `${fakeDiscussion.title}${titleUpdate}`;
  const newBody = `${fakeDiscussion.body}${bodyUpdate}`;

  // replacing the title with the new title
  await userEvent.type(titleField, newTitle);

  // appending updated to the body
  await userEvent.type(bodyField, bodyUpdate);

  const submitButton = within(drawer).getByRole('button', {
    name: /submit/i,
  });

  await userEvent.click(submitButton);

  await waitFor(() => expect(drawer).not.toBeInTheDocument());

  expect(
    await screen.findByRole('heading', { name: newTitle }),
  ).toBeInTheDocument();
  expect(await screen.findByText(newBody)).toBeInTheDocument();
});

test(
  'should create and delete a comment on the discussion',
  async () => {
    await renderDiscussion();

    const comment = 'Hello World';

    await userEvent.click(
      screen.getByRole('button', { name: /create comment/i }),
    );

    const drawer = await screen.findByRole('dialog', {
      name: /create comment/i,
    });

    const bodyField = await within(drawer).findByText(/body/i);

    await userEvent.type(bodyField, comment);

    const submitButton = await within(drawer).findByRole('button', {
      name: /submit/i,
    });

    await userEvent.click(submitButton);

    await waitFor(() => expect(drawer).not.toBeInTheDocument());

    await screen.findByText(comment);

    const commentsList = await screen.findByRole('list', {
      name: 'comments',
    });

    const commentElements =
      await within(commentsList).findAllByRole('listitem');

    const commentElement = commentElements[0];

    expect(commentElement).toBeInTheDocument();

    const deleteCommentButton = within(commentElement).getByRole('button', {
      name: /delete comment/i,
      // exact: false,
    });

    await userEvent.click(deleteCommentButton);

    const confirmationDialog = await screen.findByRole('dialog', {
      name: /delete comment/i,
    });

    const confirmationDeleteButton = await within(
      confirmationDialog,
    ).findByRole('button', {
      name: /delete/i,
    });

    await userEvent.click(confirmationDeleteButton);

    await screen.findByText(/comment deleted/i);

    await waitFor(() => {
      expect(within(commentsList).queryByText(comment)).not.toBeInTheDocument();
    });
  },
  {
    timeout: 20000,
  },
);
```

### E2E

End-to-End Testing is a method that evaluates an application as a whole. These tests involve automating the complete application, including both the frontend and backend, to confirm that the entire system functions correctly. End-to-End tests simulate how a user would interact with the application.

To run locally, make sure you ran `yarn playwright install --with-deps` before.

[E2E Example Code](../e2e/tests/smoke.spec.ts)

## Tooling:

#### [Vitest](https://vitest.dev)

Vitest is a powerful testing framework with features similar to Jest, but it's more up-to-date and works well with modern tools. It's highly customizable and flexible, making it a popular option for testing JavaScript code.

#### [Testing Library](https://testing-library.com/)

Testing library is a set of libraries and tools that makes testing easier than ever before. Its philosophy is to test your app in a way it is being used by a real world user instead of testing implementation details. For example, don't test what is the current state value in a component, but test what that component renders on the screen for its user. If you refactor your app to use a different state management solution for example, the tests should still be relevant as the actual component output to the user shouldn't change.

#### [Playwright](https://playwright.dev)

Playwright is a tool for running e2e tests in an automated way.
You define all the commands a real world user would execute when using the app and then start the test. It can be started in 2 modes:

- Browser mode - it will open a dedicated browser and run your application from start to finish. You get a nice set of tools to visualize and inspect your application on each step. Since this is a more expensive option, you want to run it only locally when developing the application.
- Headless mode - it will start a headless browser and run your application. Very useful for integrating with CI/CD to run it on every deploy.

#### [MSW](https://mswjs.io)

For prototyping the API use msw, which is a great tool for quickly creating frontends without worrying about servers. It is not an actual backend, but a mocked server inside a service worker that intercepts all HTTP requests and returns desired responses based on the handlers you define. This is especially useful if you only have access to the frontend and are blocked by some not implemented features on the backend. This way, you will not be forced to wait for the feature to be completed or hardcode response data in the code, but use actual HTTP calls to build frontend features.

It can be used for designing API endpoints. The business logic of the mocked API can be created in its handlers.

[API Handlers Example Code](../src/testing/mocks/handlers/auth.ts)

[Data Models Example Code](../src/testing/mocks/db.ts)

Having a fully functional mocked API server is also handy when it comes to testing, you don't have to mock fetch, but make requests to the mocked server instead with the data your application would expect.
