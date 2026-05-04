const RAZORPAY_CHECKOUT_URL = "https://checkout.razorpay.com/v1/checkout.js";

/**
 * Loads Razorpay checkout.js once. Resolves true when `window.Razorpay` is a constructor.
 */
export function loadRazorpayCheckout() {
  if (typeof window !== "undefined" && typeof window.Razorpay === "function") {
    return Promise.resolve(true);
  }

  const existing =
    typeof document !== "undefined"
      ? document.querySelector(`script[src="${RAZORPAY_CHECKOUT_URL}"]`)
      : null;

  if (existing) {
    return new Promise((resolve) => {
      if (typeof window.Razorpay === "function") return resolve(true);
      existing.addEventListener(
        "load",
        () => resolve(typeof window.Razorpay === "function"),
        { once: true }
      );
      existing.addEventListener("error", () => resolve(false), { once: true });
    });
  }

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = RAZORPAY_CHECKOUT_URL;
    script.async = true;
    script.onload = () => resolve(typeof window.Razorpay === "function");
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}
