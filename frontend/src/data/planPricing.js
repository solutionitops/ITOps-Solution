// Plan prices shown on the pricing page, per month. `yearly` is the monthly
// equivalent when billed annually.
//
// These figures are carried over unchanged from the previous pricing page
// (PLAN_CONFIG in pages/Pricing.jsx). They are display values only: checkout
// uses the Stripe price configured for each plan on the server, so keep the two
// in step. Plan limits are NOT stored here — they come from the plan catalog.
export const PLAN_PRICES = {
  STARTER: { NPR: { monthly: 0, yearly: 0 }, USD: { monthly: 0, yearly: 0 } },
  PROFESSIONAL: { NPR: { monthly: 2499, yearly: 1999 }, USD: { monthly: 19, yearly: 15 } },
  BUSINESS: { NPR: { monthly: 7999, yearly: 6399 }, USD: { monthly: 59, yearly: 47 } },
  ENTERPRISE: null // custom
};
export const RECOMMENDED_PLAN = "PROFESSIONAL";
export const CURRENCIES = {
  NPR: { label: "NPR · रू", fmt: n => `रू ${Number(n).toLocaleString("en-IN")}` },
  USD: { label: "USD · $", fmt: n => `$${Number(n).toLocaleString("en-US")}` }
};
