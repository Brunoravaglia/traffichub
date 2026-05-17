export const ABACATEPAY_V2_API_BASE = "https://api.abacatepay.com/v2";

type AbacateResponse<T> = {
  data?: T;
  success?: boolean;
  error?: string | null;
};

export type AbacateCustomer = {
  id: string;
  email?: string | null;
  name?: string | null;
  cellphone?: string | null;
  taxId?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type AbacateProduct = {
  id: string;
  externalId?: string | null;
  name?: string | null;
  description?: string | null;
  price?: number | null;
  cycle?: string | null;
  status?: string | null;
};

export type AbacateCheckout = {
  id: string;
  externalId?: string | null;
  url?: string | null;
  status?: string | null;
  amount?: number | null;
  paidAmount?: number | null;
  customerId?: string | null;
  items?: Array<{ id: string; quantity: number }> | null;
  methods?: string[] | null;
};

type ProductConfig = {
  externalId: string;
  name: string;
  price: number;
  description?: string;
  cycle?: "MONTHLY" | "ANNUALLY" | "WEEKLY" | "SEMIANNUALLY";
};

type CustomerConfig = {
  email: string;
  name?: string | null;
  cellphone?: string | null;
  taxId?: string | null;
  metadata?: Record<string, unknown>;
};

function buildHeaders(apiKey: string, headers?: HeadersInit): Headers {
  const resolved = new Headers(headers);
  resolved.set("Authorization", `Bearer ${apiKey}`);
  if (!resolved.has("Content-Type")) {
    resolved.set("Content-Type", "application/json");
  }
  return resolved;
}

export async function abacateFetch<T>(
  apiKey: string,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${ABACATEPAY_V2_API_BASE}${path}`, {
    ...init,
    headers: buildHeaders(apiKey, init?.headers),
  });

  const payload = (await response.json().catch(() => null)) as AbacateResponse<T> | null;
  if (!response.ok || !payload?.success || !payload.data) {
    throw new Error(payload?.error ?? `Abacate Pay request failed (${response.status})`);
  }

  return payload.data;
}

export async function getOrCreateCustomer(
  apiKey: string,
  config: CustomerConfig,
): Promise<AbacateCustomer> {
  return await abacateFetch<AbacateCustomer>(apiKey, "/customers/create", {
    method: "POST",
    body: JSON.stringify(config),
  });
}

export async function getProductByExternalId(
  apiKey: string,
  externalId: string,
): Promise<AbacateProduct | null> {
  const response = await fetch(
    `${ABACATEPAY_V2_API_BASE}/products/get?externalId=${encodeURIComponent(externalId)}`,
    {
      method: "GET",
      headers: buildHeaders(apiKey, { "Content-Type": "application/json" }),
    },
  );

  if (response.status === 404) {
    return null;
  }

  const payload = (await response.json().catch(() => null)) as AbacateResponse<AbacateProduct> | null;
  if (!response.ok || !payload?.success || !payload.data) {
    throw new Error(payload?.error ?? `Abacate Pay product lookup failed (${response.status})`);
  }

  return payload.data;
}

export async function getOrCreateProduct(
  apiKey: string,
  config: ProductConfig,
): Promise<AbacateProduct> {
  const existing = await getProductByExternalId(apiKey, config.externalId);
  if (existing) {
    return existing;
  }

  return await abacateFetch<AbacateProduct>(apiKey, "/products/create", {
    method: "POST",
    body: JSON.stringify({
      externalId: config.externalId,
      name: config.name,
      description: config.description,
      price: config.price,
      currency: "BRL",
      cycle: config.cycle ?? null,
    }),
  });
}

export async function createSubscriptionCheckout(
  apiKey: string,
  payload: {
    productId: string;
    customerId: string;
    externalId: string;
    completionUrl: string;
    returnUrl: string;
    metadata?: Record<string, unknown>;
  },
): Promise<AbacateCheckout> {
  return await abacateFetch<AbacateCheckout>(apiKey, "/subscriptions/create", {
    method: "POST",
    body: JSON.stringify({
      items: [{ id: payload.productId, quantity: 1 }],
      customerId: payload.customerId,
      methods: ["CARD"],
      externalId: payload.externalId,
      completionUrl: payload.completionUrl,
      returnUrl: payload.returnUrl,
      metadata: payload.metadata ?? {},
    }),
  });
}

export async function createCheckout(
  apiKey: string,
  payload: {
    items: Array<{ id: string; quantity: number }>;
    customerId: string;
    externalId: string;
    completionUrl: string;
    returnUrl: string;
    methods?: Array<"PIX" | "CARD">;
    metadata?: Record<string, unknown>;
    coupons?: string[];
  },
): Promise<AbacateCheckout> {
  return await abacateFetch<AbacateCheckout>(apiKey, "/checkouts/create", {
    method: "POST",
    body: JSON.stringify({
      items: payload.items,
      customerId: payload.customerId,
      methods: payload.methods ?? ["PIX", "CARD"],
      externalId: payload.externalId,
      completionUrl: payload.completionUrl,
      returnUrl: payload.returnUrl,
      metadata: payload.metadata ?? {},
      coupons: payload.coupons ?? [],
    }),
  });
}

export async function verifyAbacateSignature(
  rawBody: string,
  secret: string,
  signatureFromHeader: string,
): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
  const expected = btoa(String.fromCharCode(...new Uint8Array(signature)));
  return expected === signatureFromHeader;
}

export function mapAbacateFrequencyToInterval(
  value?: string | null,
): "monthly" | "yearly" | null {
  if (!value) return null;

  switch (value.toUpperCase()) {
    case "MONTHLY":
      return "monthly";
    case "ANNUALLY":
      return "yearly";
    default:
      return null;
  }
}
