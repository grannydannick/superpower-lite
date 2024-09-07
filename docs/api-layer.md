# 📡 API Layer

### Use a Single Instance of the API Client

Our application interacts with either RESTful API, and use a single instance of the API client that has been pre-configured and can be reused throughout the application. To create a single API client instance we used library [axios](https://github.com/axios/axios) with predefined configuration settings.

[API Client Example Code](../src/lib/api-client.ts)

### Define and Export Request Declarations

Rather than declaring API requests on the fly, it is recommended to define and export them separately.

Declaring API requests in a structured manner can help maintain a clean and organized codebase as everything is colocated.
Every API request declaration should consist of:

- Types and validation schemas for the request and response data
- A fetcher function that calls an endpoint, using the API client instance
- A hook that consumes the fetcher function that is built on top of libraries such as [react-query](https://tanstack.com/query), [swr](https://swr.vercel.app/), [apollo-client](https://www.apollographql.com/docs/react/), [urql](https://formidable.com/open-source/urql/), etc. to manage the data fetching and caching logic.

This approach simplifies the tracking of defined endpoints available in the application. Additionally, typing the responses and inferring them further down the application enhances application type safety.

[API Request Declarations - Query - Example Code](../src/features/services/api/get-services.ts)
[API Request Declarations - Mutation - Example Code](../src/features/messages/api/create-message.ts)
