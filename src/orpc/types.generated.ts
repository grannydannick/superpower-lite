export interface paths {
    "/healthcheck": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["healthcheck"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/methods": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["auth.authMethods"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/checkout/stripe/create-checkout-session": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["checkout.stripe.createCheckoutSession"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/checkout/stripe/checkout-session": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["checkout.stripe.getCheckoutSession"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/checkout/stripe/process-checkout-session": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["checkout.stripe.processCheckoutSession"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/checkout/flex/create-checkout-session": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["checkout.flex.createCheckoutSession"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/checkout/flex/checkout-session": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["checkout.flex.getCheckoutSession"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/checkout/flex/process-checkout-session": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["checkout.flex.processCheckoutSession"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/checkout/products": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["checkout.getProducts"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/checkout/create-checkout-session": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["checkout.createCheckoutSession"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/checkout/update-checkout-session": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["checkout.updateCheckoutSession"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/checkout/checkout-session": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["checkout.getCheckoutSession"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /** @enum {unknown} */
        CheckoutProductId: "v2-baseline-membership-20250801" | "v2-membership-advanced-upgrade-20250801" | "at-home-sample-collection-20251016" | "v2-autoimmunity-bundle-20250929" | "v2-cardiovascular-bundle-20250929" | "v2-metabolic-bundle-20250929" | "v2-fertility-bundle-20250929" | "v2-methylation-bundle-20250929" | "v2-nutrients-bundle-20250929" | "v2-baseline-blood-panel-20250801" | "v2-advanced-blood-panel-20250801" | "v2-custom-blood-panel-20251002" | "gut-microbiome-analysis-20240513" | "grail-galleri-multi-cancer-test-20240513" | "heavy-metals-20240513" | "mycotoxins-20240513" | "environmental-toxin-20240513" | "total-toxins-20240513";
        CheckoutSessionLineItem: {
            id: string;
            slug: components["schemas"]["CheckoutProductId"];
            available: boolean;
            priceId: string;
            productId: string;
            /** @enum {unknown} */
            type: "one_time" | "recurring";
            quantity: number;
            unitAmount: number;
            currency: string;
            productImages: string[];
            productTitle: string;
            productDescription?: string;
        };
        CheckoutSession: {
            id: string;
            clientSecret: string;
            lineItems: components["schemas"]["CheckoutSessionLineItem"][];
            state: string;
            available: boolean;
        };
        CreateCheckoutSession: {
            /** Format: uri */
            returnUrl: string;
            state: string;
            lineItems: {
                product: components["schemas"]["CheckoutProductId"];
                quantity: number;
                priceId?: string;
            }[];
            referralId?: string;
        };
        UpdateCheckoutSession: {
            id: string;
            state?: string;
            lineItems: {
                product: components["schemas"]["CheckoutProductId"];
                quantity: number;
                priceId?: string;
            }[];
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    healthcheck: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description healthcheck */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /**
                         * @description the health of the server
                         * @constant
                         */
                        status: "ok";
                    };
                };
            };
            /** @description 401 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "UNAUTHORIZED";
                        /** @constant */
                        status: 401;
                        /** @default Unauthorized */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 403 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "NOT_AN_ADMIN";
                        /** @constant */
                        status: 403;
                        /** @default NOT_AN_ADMIN */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 429 */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "RATE_LIMIT_EXCEEDED";
                        /** @constant */
                        status: 429;
                        /** @default RATE_LIMIT_EXCEEDED */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
        };
    };
    "auth.authMethods": {
        parameters: {
            query: {
                email: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @description the available authentication methods for the user */
                        methods: ("PASSWORD" | "OTP")[];
                    };
                };
            };
            /** @description 401 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "UNAUTHORIZED";
                        /** @constant */
                        status: 401;
                        /** @default Unauthorized */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 403 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "NOT_AN_ADMIN";
                        /** @constant */
                        status: 403;
                        /** @default NOT_AN_ADMIN */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 429 */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "RATE_LIMIT_EXCEEDED";
                        /** @constant */
                        status: 429;
                        /** @default RATE_LIMIT_EXCEEDED */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
        };
    };
    "checkout.stripe.createCheckoutSession": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /**
                     * @description State
                     * @enum {unknown}
                     */
                    state: "AL" | "AK" | "AS" | "AZ" | "AR" | "CA" | "CO" | "CT" | "DE" | "DC" | "FM" | "FL" | "GA" | "GU" | "HI" | "ID" | "IL" | "IN" | "IA" | "KS" | "KY" | "LA" | "ME" | "MH" | "MD" | "MA" | "MI" | "MN" | "MS" | "MO" | "MT" | "NE" | "NV" | "NH" | "NJ" | "NM" | "NY" | "NC" | "ND" | "MP" | "OH" | "OK" | "OR" | "PW" | "PA" | "PR" | "RI" | "SC" | "SD" | "TN" | "TX" | "UT" | "VT" | "VI" | "VA" | "WA" | "WV" | "WI" | "WY";
                    products: ({
                        /** @constant */
                        type: "product";
                        productId: components["schemas"]["CheckoutProductId"];
                    } | {
                        /** @constant */
                        type: "price";
                        priceId: string;
                    })[];
                    /** Format: uri */
                    returnUrl: string;
                    metadata?: {
                        referralId?: string;
                    };
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        checkout: {
                            id: string;
                            clientSecret: string;
                        };
                    };
                };
            };
            /** @description 400 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "BAD_REQUEST";
                        /** @constant */
                        status: 400;
                        /** @default Bad Request */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 401 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "UNAUTHORIZED";
                        /** @constant */
                        status: 401;
                        /** @default Unauthorized */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 403 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "NOT_AN_ADMIN";
                        /** @constant */
                        status: 403;
                        /** @default NOT_AN_ADMIN */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 404 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "NOT_FOUND";
                        /** @constant */
                        status: 404;
                        /** @default Not Found */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 429 */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "RATE_LIMIT_EXCEEDED";
                        /** @constant */
                        status: 429;
                        /** @default RATE_LIMIT_EXCEEDED */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 500 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "INTERNAL_SERVER_ERROR";
                        /** @constant */
                        status: 500;
                        /** @default Internal Server Error */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
        };
    };
    "checkout.stripe.getCheckoutSession": {
        parameters: {
            query: {
                checkoutSessionId: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        checkoutSession: {
                            id: string;
                            status: string | null;
                            paymentStatus: string;
                        };
                    };
                };
            };
            /** @description 400 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "BAD_REQUEST";
                        /** @constant */
                        status: 400;
                        /** @default Bad Request */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 401 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "UNAUTHORIZED";
                        /** @constant */
                        status: 401;
                        /** @default Unauthorized */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 403 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "NOT_AN_ADMIN";
                        /** @constant */
                        status: 403;
                        /** @default NOT_AN_ADMIN */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 404 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "NOT_FOUND";
                        /** @constant */
                        status: 404;
                        /** @default Not Found */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 429 */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "RATE_LIMIT_EXCEEDED";
                        /** @constant */
                        status: 429;
                        /** @default RATE_LIMIT_EXCEEDED */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 500 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "INTERNAL_SERVER_ERROR";
                        /** @constant */
                        status: 500;
                        /** @default Internal Server Error */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
        };
    };
    "checkout.stripe.processCheckoutSession": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @description The ID of the checkout session */
                    checkoutSessionId: string;
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @description whether the checkout session was processed successfully */
                        success: boolean;
                    };
                };
            };
            /** @description 400 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "BAD_REQUEST";
                        /** @constant */
                        status: 400;
                        /** @default Bad Request */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 401 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "UNAUTHORIZED";
                        /** @constant */
                        status: 401;
                        /** @default Unauthorized */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 403 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "NOT_AN_ADMIN";
                        /** @constant */
                        status: 403;
                        /** @default NOT_AN_ADMIN */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 404 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "NOT_FOUND";
                        /** @constant */
                        status: 404;
                        /** @default Not Found */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 429 */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "RATE_LIMIT_EXCEEDED";
                        /** @constant */
                        status: 429;
                        /** @default RATE_LIMIT_EXCEEDED */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 500 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "INTERNAL_SERVER_ERROR";
                        /** @constant */
                        status: 500;
                        /** @default Internal Server Error */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
        };
    };
    "checkout.flex.createCheckoutSession": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /**
                     * @description State
                     * @enum {unknown}
                     */
                    state: "AL" | "AK" | "AS" | "AZ" | "AR" | "CA" | "CO" | "CT" | "DE" | "DC" | "FM" | "FL" | "GA" | "GU" | "HI" | "ID" | "IL" | "IN" | "IA" | "KS" | "KY" | "LA" | "ME" | "MH" | "MD" | "MA" | "MI" | "MN" | "MS" | "MO" | "MT" | "NE" | "NV" | "NH" | "NJ" | "NM" | "NY" | "NC" | "ND" | "MP" | "OH" | "OK" | "OR" | "PW" | "PA" | "PR" | "RI" | "SC" | "SD" | "TN" | "TX" | "UT" | "VT" | "VI" | "VA" | "WA" | "WV" | "WI" | "WY";
                    products: ({
                        /** @constant */
                        type: "product";
                        productId: components["schemas"]["CheckoutProductId"];
                    } | {
                        /** @constant */
                        type: "price";
                        priceId: string;
                    })[];
                    /** Format: uri */
                    returnUrl: string;
                    metadata?: {
                        referralId?: string;
                    };
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        checkout: {
                            id: string;
                            redirectUrl: string;
                        };
                    };
                };
            };
            /** @description 400 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "BAD_REQUEST";
                        /** @constant */
                        status: 400;
                        /** @default Bad Request */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 401 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "UNAUTHORIZED";
                        /** @constant */
                        status: 401;
                        /** @default Unauthorized */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 403 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "NOT_AN_ADMIN";
                        /** @constant */
                        status: 403;
                        /** @default NOT_AN_ADMIN */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 404 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "NOT_FOUND";
                        /** @constant */
                        status: 404;
                        /** @default Not Found */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 429 */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "RATE_LIMIT_EXCEEDED";
                        /** @constant */
                        status: 429;
                        /** @default RATE_LIMIT_EXCEEDED */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 500 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "INTERNAL_SERVER_ERROR";
                        /** @constant */
                        status: 500;
                        /** @default Internal Server Error */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
        };
    };
    "checkout.flex.getCheckoutSession": {
        parameters: {
            query: {
                checkoutSessionId: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        checkoutSession: {
                            id: string;
                            status: string | null;
                            paymentStatus: string;
                        };
                    };
                };
            };
            /** @description 400 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "BAD_REQUEST";
                        /** @constant */
                        status: 400;
                        /** @default Bad Request */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 401 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "UNAUTHORIZED";
                        /** @constant */
                        status: 401;
                        /** @default Unauthorized */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 403 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "NOT_AN_ADMIN";
                        /** @constant */
                        status: 403;
                        /** @default NOT_AN_ADMIN */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 404 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "NOT_FOUND";
                        /** @constant */
                        status: 404;
                        /** @default Not Found */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 429 */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "RATE_LIMIT_EXCEEDED";
                        /** @constant */
                        status: 429;
                        /** @default RATE_LIMIT_EXCEEDED */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 500 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "INTERNAL_SERVER_ERROR";
                        /** @constant */
                        status: 500;
                        /** @default Internal Server Error */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
        };
    };
    "checkout.flex.processCheckoutSession": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @description The ID of the checkout session */
                    checkoutSessionId: string;
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @description whether the checkout session was processed successfully */
                        success: boolean;
                    };
                };
            };
            /** @description 400 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "BAD_REQUEST";
                        /** @constant */
                        status: 400;
                        /** @default Bad Request */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 401 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "UNAUTHORIZED";
                        /** @constant */
                        status: 401;
                        /** @default Unauthorized */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 403 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "NOT_AN_ADMIN";
                        /** @constant */
                        status: 403;
                        /** @default NOT_AN_ADMIN */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 404 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "NOT_FOUND";
                        /** @constant */
                        status: 404;
                        /** @default Not Found */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 429 */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "RATE_LIMIT_EXCEEDED";
                        /** @constant */
                        status: 429;
                        /** @default RATE_LIMIT_EXCEEDED */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 500 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "INTERNAL_SERVER_ERROR";
                        /** @constant */
                        status: 500;
                        /** @default Internal Server Error */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
        };
    };
    "checkout.getProducts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @enum {unknown} */
                    state?: "AL" | "AK" | "AS" | "AZ" | "AR" | "CA" | "CO" | "CT" | "DE" | "DC" | "FM" | "FL" | "GA" | "GU" | "HI" | "ID" | "IL" | "IN" | "IA" | "KS" | "KY" | "LA" | "ME" | "MH" | "MD" | "MA" | "MI" | "MN" | "MS" | "MO" | "MT" | "NE" | "NV" | "NH" | "NJ" | "NM" | "NY" | "NC" | "ND" | "MP" | "OH" | "OK" | "OR" | "PW" | "PA" | "PR" | "RI" | "SC" | "SD" | "TN" | "TX" | "UT" | "VT" | "VI" | "VA" | "WA" | "WV" | "WI" | "WY";
                    products: ({
                        /** @constant */
                        type: "product";
                        productId: components["schemas"]["CheckoutProductId"];
                    } | {
                        /** @constant */
                        type: "price";
                        priceId: string;
                    })[];
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        products: {
                            product: {
                                id: string;
                                name: string;
                                description: string;
                                image?: string;
                                /** @description Whether the product is available for purchase in the current state */
                                available: boolean;
                                metadata?: {
                                    isNyNj?: boolean;
                                    collectionMethod?: string;
                                };
                            };
                            price: {
                                id: string;
                                lookupKey: string | null;
                                name?: string;
                                amount: number;
                            };
                            chargeItemDefinitionIdentifier: string;
                            /** @enum {unknown} */
                            paymentProvider: "STRIPE" | "FLEX";
                        }[];
                    };
                };
            };
            /** @description 400 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "BAD_REQUEST";
                        /** @constant */
                        status: 400;
                        /** @default Bad Request */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 401 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "UNAUTHORIZED";
                        /** @constant */
                        status: 401;
                        /** @default Unauthorized */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 403 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "NOT_AN_ADMIN";
                        /** @constant */
                        status: 403;
                        /** @default NOT_AN_ADMIN */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 404 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "NOT_FOUND";
                        /** @constant */
                        status: 404;
                        /** @default Not Found */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 429 */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "RATE_LIMIT_EXCEEDED";
                        /** @constant */
                        status: 429;
                        /** @default RATE_LIMIT_EXCEEDED */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 500 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "INTERNAL_SERVER_ERROR";
                        /** @constant */
                        status: 500;
                        /** @default Internal Server Error */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
        };
    };
    "checkout.createCheckoutSession": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateCheckoutSession"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        session: components["schemas"]["CheckoutSession"];
                    };
                };
            };
            /** @description 400 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "BAD_REQUEST";
                        /** @constant */
                        status: 400;
                        /** @default Bad Request */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 401 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "UNAUTHORIZED";
                        /** @constant */
                        status: 401;
                        /** @default Unauthorized */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 403 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "NOT_AN_ADMIN";
                        /** @constant */
                        status: 403;
                        /** @default NOT_AN_ADMIN */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 404 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "NOT_FOUND";
                        /** @constant */
                        status: 404;
                        /** @default Not Found */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 429 */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "RATE_LIMIT_EXCEEDED";
                        /** @constant */
                        status: 429;
                        /** @default RATE_LIMIT_EXCEEDED */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 500 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "INTERNAL_SERVER_ERROR";
                        /** @constant */
                        status: 500;
                        /** @default Internal Server Error */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
        };
    };
    "checkout.updateCheckoutSession": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateCheckoutSession"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        session: components["schemas"]["CheckoutSession"];
                    };
                };
            };
            /** @description 400 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "BAD_REQUEST";
                        /** @constant */
                        status: 400;
                        /** @default Bad Request */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 401 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "UNAUTHORIZED";
                        /** @constant */
                        status: 401;
                        /** @default Unauthorized */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 403 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "NOT_AN_ADMIN";
                        /** @constant */
                        status: 403;
                        /** @default NOT_AN_ADMIN */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 404 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "NOT_FOUND";
                        /** @constant */
                        status: 404;
                        /** @default Not Found */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 429 */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "RATE_LIMIT_EXCEEDED";
                        /** @constant */
                        status: 429;
                        /** @default RATE_LIMIT_EXCEEDED */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 500 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "INTERNAL_SERVER_ERROR";
                        /** @constant */
                        status: 500;
                        /** @default Internal Server Error */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
        };
    };
    "checkout.getCheckoutSession": {
        parameters: {
            query: {
                id: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        session: components["schemas"]["CheckoutSession"];
                    };
                };
            };
            /** @description 400 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "BAD_REQUEST";
                        /** @constant */
                        status: 400;
                        /** @default Bad Request */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 401 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "UNAUTHORIZED";
                        /** @constant */
                        status: 401;
                        /** @default Unauthorized */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 403 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "NOT_AN_ADMIN";
                        /** @constant */
                        status: 403;
                        /** @default NOT_AN_ADMIN */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 404 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "NOT_FOUND";
                        /** @constant */
                        status: 404;
                        /** @default Not Found */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 429 */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "RATE_LIMIT_EXCEEDED";
                        /** @constant */
                        status: 429;
                        /** @default RATE_LIMIT_EXCEEDED */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
            /** @description 500 */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        defined: true;
                        /** @constant */
                        code: "INTERNAL_SERVER_ERROR";
                        /** @constant */
                        status: 500;
                        /** @default Internal Server Error */
                        message: string;
                        data?: unknown;
                    } | {
                        /** @constant */
                        defined: false;
                        code: string;
                        status: number;
                        message: string;
                        data?: unknown;
                    };
                };
            };
        };
    };
}
