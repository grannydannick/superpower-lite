## Note

Actual registration happens inside of billing-section. Thats because we need to gather all information (like all form fields, apple / google pay/ card input) to perform actual calls

You should also be aware that all of the checkout logic is currently processed inside of the `use-checkout` hook including the registration call

As of Aug 28 2025, we have following flow of events:

1. Perform registration
2. Create subscription
