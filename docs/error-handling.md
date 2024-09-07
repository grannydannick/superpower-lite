# ⚠️ Error Handling

### API Errors

Implement an interceptor to manage errors effectively. This interceptor can be utilized to trigger notification toasts informing users of errors, log out unauthorized users, or send requests to refresh tokens to maintain secure and seamless application operation.

[API Errors Notification Example Code](../src/lib/api-client.ts)

### In App Errors

Utilize error boundaries in React to handle errors within specific parts of your application. Instead of having only one error boundary for the entire app, consider placing multiple error boundaries in different areas. This way, if an error occurs, it can be contained and managed locally without disrupting the entire application's functionality, ensuring a smoother user experience.

```ts
      <ContentLayout title={discussion.title}>
        <DiscussionView discussionId={discussionId} />
        <div className="mt-8">
          <ErrorBoundary
            fallback={
              <div>Failed to load comments. Try to refresh the page.</div>
            }
          >
            <Comments discussionId={discussionId} />
          </ErrorBoundary>
        </div>
      </ContentLayout>
```

### Error Tracking

We track any errors that occur in production. We use [New Relic](https://newrelic.com/). It will report any issue that breaks the app. You will also be able to see on which platform, browser, etc. did it occur.