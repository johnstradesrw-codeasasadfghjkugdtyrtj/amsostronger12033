import { describe, it, expect } from "vitest";
import { isSubscriptionActive, validateProof, ADMIN_EMAILS, ACCOUNT_MGMT_URL, SUPPORT_URL } from "@/lib/site";

describe("site rules", () => {
  it("expired subscription is not active", () => {
    expect(isSubscriptionActive({ expires_at: "2020-01-01", revoked: false })).toBe(false);
  });
  it("revoked subscription is not active", () => {
    expect(isSubscriptionActive({ expires_at: "2999-01-01", revoked: true })).toBe(false);
  });
  it("valid subscription is active", () => {
    expect(isSubscriptionActive({ expires_at: "2999-01-01", revoked: false })).toBe(true);
  });
  it("rejects non-image proof and >5MB", () => {
    expect(validateProof({ type: "application/pdf", size: 10 })).not.toBeNull();
    expect(validateProof({ type: "image/png", size: 6 * 1024 * 1024 })).not.toBeNull();
    expect(validateProof({ type: "image/png", size: 1000 })).toBeNull();
  });
  it("exactly two admin emails and correct Telegram links", () => {
    expect(ADMIN_EMAILS).toEqual(["dufashwenayo@gmail.com", "eclifunded@gmail.com"]);
    expect(ACCOUNT_MGMT_URL).toContain("https://t.me/fxcodding?text=");
    expect(SUPPORT_URL).toContain("https://t.me/fxcodding?text=");
  });
});
