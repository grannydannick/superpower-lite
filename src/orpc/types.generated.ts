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
    "/b2b/organizations/{organizationId}/benefits": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["b2b.getBenefits"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/b2b/organizations/{organizationId}/verify-eligibility": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["b2b.verifyEligibility"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/b2b/has-claimed-benefits": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["b2b.hasClaimedBenefits"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/b2b/organizations/{organizationId}/claim-benefits": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["b2b.claimBenefits"];
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
    "/checkout/fulfillment": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["checkout.getCheckoutFulfillment"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/family-risk/plan": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["familyRisk.getLatestFamilyRiskPlan"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/family-risk/plan/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["familyRisk.getFamilyRiskPlanById"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/family-risk/plan/{id}/share": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["familyRisk.setPublicSharing"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/gifts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["gifts.listGifts"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/gifts/{giftId}/submit": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["gifts.submitGift"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/protocol": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["protocol.getAllProtocols"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/protocol/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["protocol.getProtocolById"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/protocol/reveal/latest": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["protocol.reveal.getOrCreateReveal"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/protocol/reveal/{carePlanId}/status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["protocol.reveal.getRevealStatus"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/protocol/reveal/{carePlanId}/order": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["protocol.reveal.createProtocolOrder"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/protocol/reveal/{carePlanId}/checkout/products": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["protocol.reveal.createShopifyCheckout"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/protocol/reveal/{carePlanId}/checkout/services": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["protocol.reveal.createServiceOrders"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/protocol/reveal/{carePlanId}/steps/{step}/complete": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["protocol.reveal.markStepComplete"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/protocol/reveal/{carePlanId}/complete": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["protocol.reveal.completeReveal"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/protocol/reveal/{carePlanId}/autopilot-subscription": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["protocol.reveal.createAutopilotSubscription"];
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
        CheckoutProductId: "v2-baseline-membership-20250801" | "v2-advanced-membership-20251212" | "v2-premium-membership-20251212" | "v2-membership-advanced-upgrade-20250801" | "at-home-sample-collection-20251016" | "membership-gift-20251125" | "membership-gift-nynj-20251128" | "free-membership-gift-20251207" | "free-membership-gift-nynj-20251207" | "v2-autoimmunity-bundle-20250929" | "v2-cardiovascular-bundle-20250929" | "v2-metabolic-bundle-20250929" | "v2-fertility-bundle-20250929" | "v2-methylation-bundle-20250929" | "v2-nutrients-bundle-20250929" | "v2-baseline-blood-panel-20250801" | "v2-advanced-blood-panel-20250801" | "v2-custom-blood-panel-20251002" | "gut-microbiome-analysis-20240513" | "grail-galleri-multi-cancer-test-20240513" | "heavy-metals-20240513" | "mycotoxins-20240513" | "environmental-toxin-20240513" | "total-toxins-20240513" | "rx-semaglutide-90day-20251022" | "rx-semaglutide-180day-20251022" | "rx-semaglutide-60day-20251124";
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
            clientSecret?: string;
            lineItems: components["schemas"]["CheckoutSessionLineItem"][];
            state: string;
            available: boolean;
            total: number;
            subtotal: number;
            discount: number;
            status?: string;
            paymentStatus?: string;
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
            tags?: string[];
        };
        UpdateCheckoutSession: {
            id: string;
            state?: string;
            lineItems: {
                product: components["schemas"]["CheckoutProductId"];
                quantity: number;
                priceId?: string;
            }[];
            tags?: string[];
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
    "b2b.getBenefits": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                organizationId: string;
            };
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
                        /** Format: uuid */
                        id: string;
                        name: string;
                        defaultBenefit: {
                            productId: string;
                            quantity: number;
                            /** @enum {unknown} */
                            collectionMethod: "AT_HOME" | "IN_LAB" | "PHLEBOTOMY_KIT" | "EVENT";
                        }[];
                        /** Format: date-time */
                        createdAt: string;
                        /** Format: date-time */
                        updatedAt: string;
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
                        /** @default Organization not found */
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
    "b2b.verifyEligibility": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                organizationId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** Format: email */
                    email: string;
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
                        isEligible: boolean;
                        benefits: {
                            /** Format: uuid */
                            id: string;
                            /** Format: uuid */
                            organizationId: string;
                            /** Format: email */
                            email: string;
                            userId: string | null;
                            benefit: {
                                productId: string;
                                quantity: number;
                                /** @enum {unknown} */
                                collectionMethod: "AT_HOME" | "IN_LAB" | "PHLEBOTOMY_KIT" | "EVENT";
                            }[];
                            /** Format: date-time */
                            createdAt: string;
                            /** Format: date-time */
                            updatedAt: string;
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
                        /** @default Organization not found */
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
    "b2b.hasClaimedBenefits": {
        parameters: {
            query?: never;
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
                        hasClaimedBenefits: boolean;
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
    "b2b.claimBenefits": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                organizationId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @description The IDs of the benefits to claim */
                    benefitIds: string[];
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
                        /** @default No unclaimed benefits found */
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
                    tags?: string[];
                    /** @description State */
                    state: string;
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
                            total: number;
                            subtotal: number;
                            discount: number;
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
                    state?: string;
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
                            chargeItemDefinitionIdentifier: components["schemas"]["CheckoutProductId"];
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
    "checkout.getCheckoutFulfillment": {
        parameters: {
            query: {
                externalId: string;
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
                        fulfillment: {
                            id: string;
                            /** Format: date-time */
                            createdAt: string;
                            /** Format: date-time */
                            updatedAt: string;
                            /** @enum {unknown} */
                            status: "PENDING" | "COMPLETED" | "FAILED";
                            userId: string | null;
                            externalId: string;
                            /** @enum {unknown} */
                            vendor: "STRIPE" | "FLEX";
                        } | null;
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
    "familyRisk.getLatestFamilyRiskPlan": {
        parameters: {
            query?: never;
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
                        plan: {
                            id: string;
                            /**
                             * Format: date-time
                             * @description When the assessment was created
                             */
                            created: string;
                            /** @description ID of the related care plan */
                            carePlanId?: string;
                            /** @description ID of the related service request */
                            serviceRequestId?: string;
                            subject: {
                                id: string;
                                name: string;
                            };
                            /** @default [] */
                            basisBiomarkers: {
                                /** @description The observation ID */
                                id: string;
                                /** @description The biomarker display name */
                                name: string;
                            }[];
                            /** @default [] */
                            risks: {
                                /** @description Prediction ID (e.g., prediction-1) */
                                id: string;
                                /** @description Title of the family risk (from outcome.text) */
                                title: string;
                                /** @description Description/rationale of the risk */
                                description: string;
                                /** @description Markdown bullets explaining family relevance */
                                whyThisMattersForFamily: string;
                                /** @description Actions family members can consider */
                                whatFamilyMembersCanConsider: string;
                                /** @description 1-10 scale: 1=lifestyle, 10=inherited */
                                inheritedRiskScore: number;
                                /**
                                 * @description Biomarkers associated with this risk
                                 * @default []
                                 */
                                biomarkers: {
                                    /** @description The observation ID */
                                    id: string;
                                    /** @description The biomarker display name */
                                    name: string;
                                }[];
                                /**
                                 * @description Research citations
                                 * @default []
                                 */
                                citations: {
                                    /** @description The author(s) of the research paper */
                                    authors: string;
                                    /** @description The title of the research paper */
                                    title: string;
                                    /** @description The journal where the paper was published */
                                    journal: string;
                                    /** @description The year of publication */
                                    year: string;
                                    /** @description The DOI of the paper */
                                    doi: string;
                                }[];
                            }[];
                            /**
                             * @description Whether the plan is publicly accessible via share link
                             * @default false
                             */
                            isPubliclyShared: boolean;
                        };
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
                        /** @default Family risk plan not found */
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
    "familyRisk.getFamilyRiskPlanById": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
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
                        plan: {
                            id: string;
                            /**
                             * Format: date-time
                             * @description When the assessment was created
                             */
                            created: string;
                            /** @description ID of the related care plan */
                            carePlanId?: string;
                            /** @description ID of the related service request */
                            serviceRequestId?: string;
                            subject: {
                                id: string;
                                name: string;
                            };
                            /** @default [] */
                            basisBiomarkers: {
                                /** @description The observation ID */
                                id: string;
                                /** @description The biomarker display name */
                                name: string;
                            }[];
                            /** @default [] */
                            risks: {
                                /** @description Prediction ID (e.g., prediction-1) */
                                id: string;
                                /** @description Title of the family risk (from outcome.text) */
                                title: string;
                                /** @description Description/rationale of the risk */
                                description: string;
                                /** @description Markdown bullets explaining family relevance */
                                whyThisMattersForFamily: string;
                                /** @description Actions family members can consider */
                                whatFamilyMembersCanConsider: string;
                                /** @description 1-10 scale: 1=lifestyle, 10=inherited */
                                inheritedRiskScore: number;
                                /**
                                 * @description Biomarkers associated with this risk
                                 * @default []
                                 */
                                biomarkers: {
                                    /** @description The observation ID */
                                    id: string;
                                    /** @description The biomarker display name */
                                    name: string;
                                }[];
                                /**
                                 * @description Research citations
                                 * @default []
                                 */
                                citations: {
                                    /** @description The author(s) of the research paper */
                                    authors: string;
                                    /** @description The title of the research paper */
                                    title: string;
                                    /** @description The journal where the paper was published */
                                    journal: string;
                                    /** @description The year of publication */
                                    year: string;
                                    /** @description The DOI of the paper */
                                    doi: string;
                                }[];
                            }[];
                            /**
                             * @description Whether the plan is publicly accessible via share link
                             * @default false
                             */
                            isPubliclyShared: boolean;
                        };
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
                        /** @default Family risk plan not found */
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
    "familyRisk.setPublicSharing": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @description Whether to enable or disable public sharing */
                    enabled: boolean;
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
                        /** @constant */
                        success: true;
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
                        /** @default Family risk plan not found */
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
    "gifts.listGifts": {
        parameters: {
            query?: never;
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
                        gifts: {
                            /** Format: uuid */
                            id: string;
                            /** Format: date-time */
                            createdAt: string;
                            /** Format: date-time */
                            updatedAt: string;
                            purchaserUserId: string;
                            giftDeliveryType: ("digital" | "gift_box") | null;
                            couponId: string;
                            promotionCode: string;
                            isNyNj: boolean;
                            recipientFirstName: string | null;
                            recipientLastName: string | null;
                            recipientEmail: string | null;
                            recipientPhone: string | null;
                            recipientUserId: string | null;
                            giftMessage: string | null;
                            shippingLine1: string | null;
                            shippingLine2: string | null;
                            shippingCity: string | null;
                            shippingState: string | null;
                            shippingZipCode: string | null;
                            sentGiftAt: string | null;
                            redeemedAt: string | null;
                        }[];
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
    "gifts.submitGift": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                giftId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    recipientFirstName: string;
                    recipientLastName: string;
                    /** Format: email */
                    recipientEmail: string;
                    recipientPhone?: string;
                    giftMessage?: string;
                    /** @enum {unknown} */
                    deliveryType: "digital" | "gift_box";
                    shippingLine1?: string;
                    shippingLine2?: string;
                    shippingCity?: string;
                    shippingState?: string;
                    shippingZipCode?: string;
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
                        /** @constant */
                        status: "success";
                        gift: {
                            /** Format: uuid */
                            id: string;
                            /** Format: date-time */
                            createdAt: string;
                            /** Format: date-time */
                            updatedAt: string;
                            purchaserUserId: string;
                            giftDeliveryType: ("digital" | "gift_box") | null;
                            couponId: string;
                            promotionCode: string;
                            isNyNj: boolean;
                            recipientFirstName: string | null;
                            recipientLastName: string | null;
                            recipientEmail: string | null;
                            recipientPhone: string | null;
                            recipientUserId: string | null;
                            giftMessage: string | null;
                            shippingLine1: string | null;
                            shippingLine2: string | null;
                            shippingCity: string | null;
                            shippingState: string | null;
                            shippingZipCode: string | null;
                            sentGiftAt: string | null;
                            redeemedAt: string | null;
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
                        defined: true;
                        /** @constant */
                        code: "FORBIDDEN";
                        /** @constant */
                        status: 403;
                        /** @default You do not have permission to modify this gift */
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
                        /** @default Gift not found */
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
    "protocol.getAllProtocols": {
        parameters: {
            query?: never;
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
                        protocols: {
                            id: string;
                            title: string;
                            /** @description Markdown formatted description of protocol (generally hard coded) */
                            description: string;
                            /** @enum {unknown} */
                            status: "draft" | "active" | "on-hold" | "revoked" | "completed" | "entered-in-error" | "unknown";
                            /** Format: date-time */
                            created: string;
                            /** @description Whether this protocol should show the reveal flow */
                            showReveal?: boolean;
                            supportingInfo: {
                                display: string;
                                reference: string;
                            }[];
                            /** @default [] */
                            goals: {
                                id: string;
                                /** @enum {unknown} */
                                status: "proposed" | "planned" | "accepted" | "active" | "on-hold" | "completed" | "cancelled" | "entered-in-error" | "rejected";
                                /** @enum {unknown} */
                                priority?: "high-priority" | "medium-priority" | "low-priority";
                                /** @description Title of the goal */
                                title: string;
                                /** @description Brief introduction to the goal */
                                introduction: string;
                                /**
                                 * @description Body of the goal, markdown formatted with citations
                                 * @default []
                                 */
                                body: string[];
                                /**
                                 * @description Actions to achieve the goal, markdown formatted with citations
                                 * @default []
                                 */
                                actions: string[];
                                /**
                                 * @description IDs of biomarkers this goal addresses
                                 * @default []
                                 */
                                targetBiomarkerIds: string[];
                                /**
                                 * @description IDs of activities that help achieve this goal
                                 * @default []
                                 */
                                activityIds: string[];
                                metadata?: {
                                    /** @description Impact area of the goal, ie. Low energy */
                                    healthImpact?: string;
                                    /** @description Time to recover from the goal, ie. 6-8 weeks */
                                    recoveryTime?: string;
                                };
                                /** @default [] */
                                citations: {
                                    /** @description Citation key, ie: [^1], [^2], etc. */
                                    key: string;
                                    /** @description Citation content/reference */
                                    content: string;
                                    /**
                                     * Format: uri
                                     * @description Optional URL to source
                                     */
                                    url?: string;
                                }[];
                            }[];
                            /** @default [] */
                            activities: ({
                                /** @description Full description in markdown format with citations */
                                description: string;
                                /**
                                 * @description Supporting citations
                                 * @default []
                                 */
                                citations: {
                                    /** @description Citation key, ie: [^1], [^2], etc. */
                                    key: string;
                                    /** @description Citation content/reference */
                                    content: string;
                                    /**
                                     * Format: uri
                                     * @description Optional URL to source
                                     */
                                    url?: string;
                                }[];
                                /**
                                 * @description IDs of goals this activity achieves
                                 * @default []
                                 */
                                goalIds: string[];
                                /** @description Short summary for compact display (ie. in goal) */
                                overview?: string;
                                /** @description Short action summary for the activity */
                                actionBrief?: string;
                                /** @description Title of the activity */
                                title?: string;
                                /** @constant */
                                type: "service";
                                service: {
                                    id: string;
                                    name: string;
                                    description: string | null;
                                    /** @description Price in usd dollars (ie. 199.99) */
                                    price: number;
                                    active: boolean;
                                    bloodTubeCount: number;
                                    supportsLabOrder: boolean;
                                    /** @enum {unknown} */
                                    group?: "test-kit" | "phlebotomy-kit" | "phlebotomy" | "advisory-call";
                                    additionalClassification?: string[];
                                };
                            } | {
                                /** @description Full description in markdown format with citations */
                                description: string;
                                /**
                                 * @description Supporting citations
                                 * @default []
                                 */
                                citations: {
                                    /** @description Citation key, ie: [^1], [^2], etc. */
                                    key: string;
                                    /** @description Citation content/reference */
                                    content: string;
                                    /**
                                     * Format: uri
                                     * @description Optional URL to source
                                     */
                                    url?: string;
                                }[];
                                /**
                                 * @description IDs of goals this activity achieves
                                 * @default []
                                 */
                                goalIds: string[];
                                /** @description Short summary for compact display (ie. in goal) */
                                overview?: string;
                                /** @description Short action summary for the activity */
                                actionBrief?: string;
                                /** @description Title of the activity */
                                title?: string;
                                /** @constant */
                                type: "product";
                                product: {
                                    /** @description Shopify variant id without gid prefix, ie. 1234567890 */
                                    id: string;
                                    name: string;
                                    image?: string;
                                    /** @description Price in usd dollars (ie. 55.99) */
                                    price: number;
                                    /** @description Link to Shopify PDP with multipassed URL */
                                    url: string;
                                    /** @description Discount amount in dollars (ie. 10.50) */
                                    discount: number;
                                    type: string;
                                    inventoryQuantity: number;
                                    tags?: string[];
                                    vendor?: string;
                                };
                            } | {
                                /** @description Full description in markdown format with citations */
                                description: string;
                                /**
                                 * @description Supporting citations
                                 * @default []
                                 */
                                citations: {
                                    /** @description Citation key, ie: [^1], [^2], etc. */
                                    key: string;
                                    /** @description Citation content/reference */
                                    content: string;
                                    /**
                                     * Format: uri
                                     * @description Optional URL to source
                                     */
                                    url?: string;
                                }[];
                                /**
                                 * @description IDs of goals this activity achieves
                                 * @default []
                                 */
                                goalIds: string[];
                                /** @description Short summary for compact display (ie. in goal) */
                                overview?: string;
                                /** @description Short action summary for the activity */
                                actionBrief?: string;
                                /** @description Title of the activity */
                                title?: string;
                                /** @constant */
                                type: "prescription";
                                prescription: {
                                    /** @description Unique Rx catalog entry identifier (ie. rx-semaglutide) */
                                    id: string;
                                    /** @description URL to prescription ordering page (ie. /questionnaire/rx-assessment-semaglutide) */
                                    intakeUrl: string;
                                    /** @description URL to prescription PDP page (ie. /prescriptions/rx-semaglutide) */
                                    pdpUrl: string;
                                    type: string;
                                    source: string;
                                    name: string;
                                    description: string;
                                    /** @description Price as a string in usd dollars (ie. 129) */
                                    price: string;
                                    active: boolean;
                                    tags: string[];
                                };
                            } | {
                                /** @description Full description in markdown format with citations */
                                description: string;
                                /**
                                 * @description Supporting citations
                                 * @default []
                                 */
                                citations: {
                                    /** @description Citation key, ie: [^1], [^2], etc. */
                                    key: string;
                                    /** @description Citation content/reference */
                                    content: string;
                                    /**
                                     * Format: uri
                                     * @description Optional URL to source
                                     */
                                    url?: string;
                                }[];
                                /**
                                 * @description IDs of goals this activity achieves
                                 * @default []
                                 */
                                goalIds: string[];
                                /** @description Short summary for compact display (ie. in goal) */
                                overview?: string;
                                /** @description Short action summary for the activity */
                                actionBrief?: string;
                                /** @description Title of the activity */
                                title?: string;
                                /** @constant */
                                type: "avoid-product";
                            } | {
                                /** @description Full description in markdown format with citations */
                                description: string;
                                /**
                                 * @description Supporting citations
                                 * @default []
                                 */
                                citations: {
                                    /** @description Citation key, ie: [^1], [^2], etc. */
                                    key: string;
                                    /** @description Citation content/reference */
                                    content: string;
                                    /**
                                     * Format: uri
                                     * @description Optional URL to source
                                     */
                                    url?: string;
                                }[];
                                /**
                                 * @description IDs of goals this activity achieves
                                 * @default []
                                 */
                                goalIds: string[];
                                /** @description Short summary for compact display (ie. in goal) */
                                overview?: string;
                                /** @description Short action summary for the activity */
                                actionBrief?: string;
                                /** @description Title of the activity */
                                title?: string;
                                /** @constant */
                                type: "lifestyle";
                            } | {
                                /** @description Full description in markdown format with citations */
                                description: string;
                                /**
                                 * @description Supporting citations
                                 * @default []
                                 */
                                citations: {
                                    /** @description Citation key, ie: [^1], [^2], etc. */
                                    key: string;
                                    /** @description Citation content/reference */
                                    content: string;
                                    /**
                                     * Format: uri
                                     * @description Optional URL to source
                                     */
                                    url?: string;
                                }[];
                                /**
                                 * @description IDs of goals this activity achieves
                                 * @default []
                                 */
                                goalIds: string[];
                                /** @description Short summary for compact display (ie. in goal) */
                                overview?: string;
                                /** @description Short action summary for the activity */
                                actionBrief?: string;
                                /** @description Title of the activity */
                                title?: string;
                                /** @constant */
                                type: "nutrition";
                            } | {
                                /** @description Full description in markdown format with citations */
                                description: string;
                                /**
                                 * @description Supporting citations
                                 * @default []
                                 */
                                citations: {
                                    /** @description Citation key, ie: [^1], [^2], etc. */
                                    key: string;
                                    /** @description Citation content/reference */
                                    content: string;
                                    /**
                                     * Format: uri
                                     * @description Optional URL to source
                                     */
                                    url?: string;
                                }[];
                                /**
                                 * @description IDs of goals this activity achieves
                                 * @default []
                                 */
                                goalIds: string[];
                                /** @description Short summary for compact display (ie. in goal) */
                                overview?: string;
                                /** @description Short action summary for the activity */
                                actionBrief?: string;
                                /** @description Title of the activity */
                                title?: string;
                                /** @constant */
                                type: "general";
                            })[];
                            /** @description Calculated autopilot subscription price in dollars (ie. 129.99) */
                            autopilotPrice?: number | null;
                        }[];
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
    "protocol.getProtocolById": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
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
                        protocol: {
                            id: string;
                            title: string;
                            /** @description Markdown formatted description of protocol (generally hard coded) */
                            description: string;
                            /** @enum {unknown} */
                            status: "draft" | "active" | "on-hold" | "revoked" | "completed" | "entered-in-error" | "unknown";
                            /** Format: date-time */
                            created: string;
                            /** @description Whether this protocol should show the reveal flow */
                            showReveal?: boolean;
                            supportingInfo: {
                                display: string;
                                reference: string;
                            }[];
                            /** @default [] */
                            goals: {
                                id: string;
                                /** @enum {unknown} */
                                status: "proposed" | "planned" | "accepted" | "active" | "on-hold" | "completed" | "cancelled" | "entered-in-error" | "rejected";
                                /** @enum {unknown} */
                                priority?: "high-priority" | "medium-priority" | "low-priority";
                                /** @description Title of the goal */
                                title: string;
                                /** @description Brief introduction to the goal */
                                introduction: string;
                                /**
                                 * @description Body of the goal, markdown formatted with citations
                                 * @default []
                                 */
                                body: string[];
                                /**
                                 * @description Actions to achieve the goal, markdown formatted with citations
                                 * @default []
                                 */
                                actions: string[];
                                /**
                                 * @description IDs of biomarkers this goal addresses
                                 * @default []
                                 */
                                targetBiomarkerIds: string[];
                                /**
                                 * @description IDs of activities that help achieve this goal
                                 * @default []
                                 */
                                activityIds: string[];
                                metadata?: {
                                    /** @description Impact area of the goal, ie. Low energy */
                                    healthImpact?: string;
                                    /** @description Time to recover from the goal, ie. 6-8 weeks */
                                    recoveryTime?: string;
                                };
                                /** @default [] */
                                citations: {
                                    /** @description Citation key, ie: [^1], [^2], etc. */
                                    key: string;
                                    /** @description Citation content/reference */
                                    content: string;
                                    /**
                                     * Format: uri
                                     * @description Optional URL to source
                                     */
                                    url?: string;
                                }[];
                            }[];
                            /** @default [] */
                            activities: ({
                                /** @description Full description in markdown format with citations */
                                description: string;
                                /**
                                 * @description Supporting citations
                                 * @default []
                                 */
                                citations: {
                                    /** @description Citation key, ie: [^1], [^2], etc. */
                                    key: string;
                                    /** @description Citation content/reference */
                                    content: string;
                                    /**
                                     * Format: uri
                                     * @description Optional URL to source
                                     */
                                    url?: string;
                                }[];
                                /**
                                 * @description IDs of goals this activity achieves
                                 * @default []
                                 */
                                goalIds: string[];
                                /** @description Short summary for compact display (ie. in goal) */
                                overview?: string;
                                /** @description Short action summary for the activity */
                                actionBrief?: string;
                                /** @description Title of the activity */
                                title?: string;
                                /** @constant */
                                type: "service";
                                service: {
                                    id: string;
                                    name: string;
                                    description: string | null;
                                    /** @description Price in usd dollars (ie. 199.99) */
                                    price: number;
                                    active: boolean;
                                    bloodTubeCount: number;
                                    supportsLabOrder: boolean;
                                    /** @enum {unknown} */
                                    group?: "test-kit" | "phlebotomy-kit" | "phlebotomy" | "advisory-call";
                                    additionalClassification?: string[];
                                };
                            } | {
                                /** @description Full description in markdown format with citations */
                                description: string;
                                /**
                                 * @description Supporting citations
                                 * @default []
                                 */
                                citations: {
                                    /** @description Citation key, ie: [^1], [^2], etc. */
                                    key: string;
                                    /** @description Citation content/reference */
                                    content: string;
                                    /**
                                     * Format: uri
                                     * @description Optional URL to source
                                     */
                                    url?: string;
                                }[];
                                /**
                                 * @description IDs of goals this activity achieves
                                 * @default []
                                 */
                                goalIds: string[];
                                /** @description Short summary for compact display (ie. in goal) */
                                overview?: string;
                                /** @description Short action summary for the activity */
                                actionBrief?: string;
                                /** @description Title of the activity */
                                title?: string;
                                /** @constant */
                                type: "product";
                                product: {
                                    /** @description Shopify variant id without gid prefix, ie. 1234567890 */
                                    id: string;
                                    name: string;
                                    image?: string;
                                    /** @description Price in usd dollars (ie. 55.99) */
                                    price: number;
                                    /** @description Link to Shopify PDP with multipassed URL */
                                    url: string;
                                    /** @description Discount amount in dollars (ie. 10.50) */
                                    discount: number;
                                    type: string;
                                    inventoryQuantity: number;
                                    tags?: string[];
                                    vendor?: string;
                                };
                            } | {
                                /** @description Full description in markdown format with citations */
                                description: string;
                                /**
                                 * @description Supporting citations
                                 * @default []
                                 */
                                citations: {
                                    /** @description Citation key, ie: [^1], [^2], etc. */
                                    key: string;
                                    /** @description Citation content/reference */
                                    content: string;
                                    /**
                                     * Format: uri
                                     * @description Optional URL to source
                                     */
                                    url?: string;
                                }[];
                                /**
                                 * @description IDs of goals this activity achieves
                                 * @default []
                                 */
                                goalIds: string[];
                                /** @description Short summary for compact display (ie. in goal) */
                                overview?: string;
                                /** @description Short action summary for the activity */
                                actionBrief?: string;
                                /** @description Title of the activity */
                                title?: string;
                                /** @constant */
                                type: "prescription";
                                prescription: {
                                    /** @description Unique Rx catalog entry identifier (ie. rx-semaglutide) */
                                    id: string;
                                    /** @description URL to prescription ordering page (ie. /questionnaire/rx-assessment-semaglutide) */
                                    intakeUrl: string;
                                    /** @description URL to prescription PDP page (ie. /prescriptions/rx-semaglutide) */
                                    pdpUrl: string;
                                    type: string;
                                    source: string;
                                    name: string;
                                    description: string;
                                    /** @description Price as a string in usd dollars (ie. 129) */
                                    price: string;
                                    active: boolean;
                                    tags: string[];
                                };
                            } | {
                                /** @description Full description in markdown format with citations */
                                description: string;
                                /**
                                 * @description Supporting citations
                                 * @default []
                                 */
                                citations: {
                                    /** @description Citation key, ie: [^1], [^2], etc. */
                                    key: string;
                                    /** @description Citation content/reference */
                                    content: string;
                                    /**
                                     * Format: uri
                                     * @description Optional URL to source
                                     */
                                    url?: string;
                                }[];
                                /**
                                 * @description IDs of goals this activity achieves
                                 * @default []
                                 */
                                goalIds: string[];
                                /** @description Short summary for compact display (ie. in goal) */
                                overview?: string;
                                /** @description Short action summary for the activity */
                                actionBrief?: string;
                                /** @description Title of the activity */
                                title?: string;
                                /** @constant */
                                type: "avoid-product";
                            } | {
                                /** @description Full description in markdown format with citations */
                                description: string;
                                /**
                                 * @description Supporting citations
                                 * @default []
                                 */
                                citations: {
                                    /** @description Citation key, ie: [^1], [^2], etc. */
                                    key: string;
                                    /** @description Citation content/reference */
                                    content: string;
                                    /**
                                     * Format: uri
                                     * @description Optional URL to source
                                     */
                                    url?: string;
                                }[];
                                /**
                                 * @description IDs of goals this activity achieves
                                 * @default []
                                 */
                                goalIds: string[];
                                /** @description Short summary for compact display (ie. in goal) */
                                overview?: string;
                                /** @description Short action summary for the activity */
                                actionBrief?: string;
                                /** @description Title of the activity */
                                title?: string;
                                /** @constant */
                                type: "lifestyle";
                            } | {
                                /** @description Full description in markdown format with citations */
                                description: string;
                                /**
                                 * @description Supporting citations
                                 * @default []
                                 */
                                citations: {
                                    /** @description Citation key, ie: [^1], [^2], etc. */
                                    key: string;
                                    /** @description Citation content/reference */
                                    content: string;
                                    /**
                                     * Format: uri
                                     * @description Optional URL to source
                                     */
                                    url?: string;
                                }[];
                                /**
                                 * @description IDs of goals this activity achieves
                                 * @default []
                                 */
                                goalIds: string[];
                                /** @description Short summary for compact display (ie. in goal) */
                                overview?: string;
                                /** @description Short action summary for the activity */
                                actionBrief?: string;
                                /** @description Title of the activity */
                                title?: string;
                                /** @constant */
                                type: "nutrition";
                            } | {
                                /** @description Full description in markdown format with citations */
                                description: string;
                                /**
                                 * @description Supporting citations
                                 * @default []
                                 */
                                citations: {
                                    /** @description Citation key, ie: [^1], [^2], etc. */
                                    key: string;
                                    /** @description Citation content/reference */
                                    content: string;
                                    /**
                                     * Format: uri
                                     * @description Optional URL to source
                                     */
                                    url?: string;
                                }[];
                                /**
                                 * @description IDs of goals this activity achieves
                                 * @default []
                                 */
                                goalIds: string[];
                                /** @description Short summary for compact display (ie. in goal) */
                                overview?: string;
                                /** @description Short action summary for the activity */
                                actionBrief?: string;
                                /** @description Title of the activity */
                                title?: string;
                                /** @constant */
                                type: "general";
                            })[];
                            /** @description Calculated autopilot subscription price in dollars (ie. 129.99) */
                            autopilotPrice?: number | null;
                        };
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
                        /** @default Protocol not found */
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
    "protocol.reveal.getOrCreateReveal": {
        parameters: {
            query?: never;
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
                        carePlanId: string | null;
                        showReveal: boolean;
                        revealCompleted: boolean;
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
    "protocol.reveal.getRevealStatus": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                carePlanId: string;
            };
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
                        reveal: {
                            carePlanId: string;
                            userId: string;
                            completedAt: string | null;
                            resultsOverviewCompletedAt: string | null;
                            productCheckoutCompletedAt: string | null;
                            serviceCheckoutCompletedAt: string | null;
                            /** Format: date-time */
                            createdAt: string;
                            /** Format: date-time */
                            updatedAt: string;
                            protocolOrder?: {
                                id: string;
                                userId: string;
                                shopifyOrderId: string | null;
                                shopifyOrderInvoiceUrl: string | null;
                                serviceItems: {
                                    id: string;
                                    serviceId: string;
                                    serviceName: string;
                                    /** @description FHIR ServiceRequest ID - this will be empty for any addon panels */
                                    fhirServiceRequestId: string | null;
                                    /** @description FHIR ServiceRequest ID of the base panel when this item is an addon */
                                    parentServiceRequestId: string | null;
                                    protocolOrderId: string | null;
                                    /** Format: date-time */
                                    createdAt: string;
                                    /** Format: date-time */
                                    updatedAt: string;
                                    /** @enum {unknown} */
                                    fulfillmentStatus?: "PENDING" | "DRAFT" | "BOOKED";
                                }[];
                                rxItems: {
                                    id: string;
                                    rxCatalogId: string;
                                    fhirQuestionnaireResponseId: string | null;
                                    protocolOrderId: string | null;
                                    /** Format: date-time */
                                    createdAt: string;
                                    /** Format: date-time */
                                    updatedAt: string;
                                    /** @enum {unknown} */
                                    fulfillmentStatus?: "PENDING" | "IN_PROGRESS" | "COMPLETED";
                                }[];
                                metadata?: unknown | null;
                                /** Format: date-time */
                                createdAt: string;
                                /** Format: date-time */
                                updatedAt: string;
                            } | null;
                        };
                        progress: {
                            resultsOverviewCompleted: boolean;
                            productCheckoutCompleted: boolean;
                            serviceCheckoutCompleted: boolean;
                        };
                        fulfillmentStates: {
                            services: {
                                [key: string]: "PENDING" | "DRAFT" | "BOOKED";
                            };
                            rx: {
                                [key: string]: "PENDING" | "IN_PROGRESS" | "COMPLETED";
                            };
                            /** @enum {unknown} */
                            products: "PENDING" | "CHECKOUT_STARTED" | "COMPLETED";
                        };
                    } | null;
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
    "protocol.reveal.createProtocolOrder": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                carePlanId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    services?: {
                        serviceId: string;
                        serviceName: string;
                    }[];
                    rx?: {
                        rxCatalogId: string;
                    }[];
                    products?: {
                        id: string;
                        name: string;
                        image?: string;
                        price: number;
                        url: string;
                        discount: number;
                        type: string;
                        inventoryQuantity: number;
                        tags?: string[];
                        vendor?: string;
                        quantity?: number;
                    }[];
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
                        protocolOrder: {
                            id: string;
                            userId: string;
                            shopifyOrderId: string | null;
                            shopifyOrderInvoiceUrl: string | null;
                            serviceItems: {
                                id: string;
                                serviceId: string;
                                serviceName: string;
                                /** @description FHIR ServiceRequest ID - this will be empty for any addon panels */
                                fhirServiceRequestId: string | null;
                                /** @description FHIR ServiceRequest ID of the base panel when this item is an addon */
                                parentServiceRequestId: string | null;
                                protocolOrderId: string | null;
                                /** Format: date-time */
                                createdAt: string;
                                /** Format: date-time */
                                updatedAt: string;
                                /** @enum {unknown} */
                                fulfillmentStatus?: "PENDING" | "DRAFT" | "BOOKED";
                            }[];
                            rxItems: {
                                id: string;
                                rxCatalogId: string;
                                fhirQuestionnaireResponseId: string | null;
                                protocolOrderId: string | null;
                                /** Format: date-time */
                                createdAt: string;
                                /** Format: date-time */
                                updatedAt: string;
                                /** @enum {unknown} */
                                fulfillmentStatus?: "PENDING" | "IN_PROGRESS" | "COMPLETED";
                            }[];
                            metadata?: unknown | null;
                            /** Format: date-time */
                            createdAt: string;
                            /** Format: date-time */
                            updatedAt: string;
                        };
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
    "protocol.reveal.createShopifyCheckout": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                carePlanId: string;
            };
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
                        checkoutUrl: string | null;
                        shopifyOrderId: string | null;
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
                        /** @default Checkout not found */
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
    "protocol.reveal.createServiceOrders": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                carePlanId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    paymentMethodId?: string;
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
                        credits: (unknown | null)[];
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
    "protocol.reveal.markStepComplete": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                carePlanId: string;
                step: "intro";
            };
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
                        reveal: {
                            carePlanId: string;
                            userId: string;
                            completedAt: string | null;
                            resultsOverviewCompletedAt: string | null;
                            productCheckoutCompletedAt: string | null;
                            serviceCheckoutCompletedAt: string | null;
                            /** Format: date-time */
                            createdAt: string;
                            /** Format: date-time */
                            updatedAt: string;
                        };
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
    "protocol.reveal.completeReveal": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                carePlanId: string;
            };
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
                        reveal: {
                            carePlanId: string;
                            userId: string;
                            completedAt: string | null;
                            resultsOverviewCompletedAt: string | null;
                            productCheckoutCompletedAt: string | null;
                            serviceCheckoutCompletedAt: string | null;
                            /** Format: date-time */
                            createdAt: string;
                            /** Format: date-time */
                            updatedAt: string;
                        };
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
    "protocol.reveal.createAutopilotSubscription": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                carePlanId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** Format: uri */
                    returnUrl: string;
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
                        /** Format: uri */
                        checkoutUrl: string;
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
