import { describe, expect, it, vi, beforeEach } from "vitest";

/**
 * Covers the two failure modes that can't be reached from SQL: that a bogus
 * booking code never creates a storage object, and that an unreadable catalogue
 * fails closed instead of quoting hardcoded prices.
 */

const storageUpload = vi.fn();
const state: {
  bookingRow: Record<string, unknown> | null;
  updateRows: unknown[] | null;
  passQuery: { data: unknown[] | null; error: unknown };
} = { bookingRow: null, updateRows: [], passQuery: { data: [], error: null } };

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  headers: async () => new Map([["x-forwarded-for", "203.0.113.7"]]),
}));
vi.mock("@/lib/booking/env", () => ({
  isSupabaseConfigured: () => true,
  IS_PREVIEW_BOOKING: false,
}));
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    storage: { from: () => ({ upload: storageUpload }) },
    from: (table: string) => {
      const chain: Record<string, unknown> = {};
      const self = () => chain;
      Object.assign(chain, {
        select: self,
        eq: self,
        order: self,
        update: self,
        maybeSingle: async () => ({ data: state.bookingRow, error: null }),
        then: undefined,
      });
      // `update(...).eq(...).eq(...).select(...)` resolves to the row list.
      (chain as { select: unknown }).select = () =>
        table === "bookings" && state.updateRows !== null
          ? Object.assign(Promise.resolve({ data: state.updateRows, error: null }), chain)
          : Object.assign(Promise.resolve(state.passQuery), chain);
      return chain;
    },
    rpc: () => ({ returns: () => ({ single: async () => ({ data: null, error: null }) }) }),
  }),
}));

const { submitPayment } = await import("@/app/actions/booking");
const { getPassCatalogue } = await import("@/lib/booking/passes");

beforeEach(() => {
  storageUpload.mockReset();
  storageUpload.mockResolvedValue({ error: null });
  state.bookingRow = null;
  state.updateRows = [];
  state.passQuery = { data: [], error: null };
});

function proofForm() {
  const fd = new FormData();
  fd.append("proof", new File([new Uint8Array(1024)], "proof.png", { type: "image/png" }));
  return fd;
}

describe("submitPayment", () => {
  it("does not upload proof for a booking code that isn't awaiting payment", async () => {
    state.bookingRow = null; // no matching PENDING_PAYMENT booking

    const result = await submitPayment(
      { bookingCode: "18SE-FAKE", utr: "483910293015" },
      proofForm(),
    );

    expect(result.ok).toBe(false);
    expect(storageUpload).not.toHaveBeenCalled();
  });

  it("does not upload proof once the hold has expired", async () => {
    state.bookingRow = {
      booking_code: "18SE-1042",
      status: "PENDING_PAYMENT",
      reserved_until: new Date(Date.now() - 60_000).toISOString(),
    };

    const result = await submitPayment(
      { bookingCode: "18SE-1042", utr: "483910293015" },
      proofForm(),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/expired/i);
    expect(storageUpload).not.toHaveBeenCalled();
  });

  it("rejects an oversized proof before touching storage", async () => {
    state.bookingRow = {
      booking_code: "18SE-1042",
      status: "PENDING_PAYMENT",
      reserved_until: null,
    };
    const fd = new FormData();
    fd.append(
      "proof",
      new File([new Uint8Array(6 * 1024 * 1024)], "huge.png", { type: "image/png" }),
    );

    const result = await submitPayment({ bookingCode: "18SE-1042", utr: "483910293015" }, fd);

    expect(result.ok).toBe(false);
    expect(storageUpload).not.toHaveBeenCalled();
  });

  it("rejects a disallowed file type", async () => {
    const fd = new FormData();
    fd.append("proof", new File([new Uint8Array(64)], "x.pdf", { type: "application/pdf" }));

    const result = await submitPayment({ bookingCode: "18SE-1042", utr: "483910293015" }, fd);

    expect(result.ok).toBe(false);
    expect(storageUpload).not.toHaveBeenCalled();
  });

  it("reports failure when the update matches zero rows", async () => {
    state.bookingRow = {
      booking_code: "18SE-1042",
      status: "PENDING_PAYMENT",
      reserved_until: null,
    };
    state.updateRows = []; // zero-row update returns no error

    const result = await submitPayment(
      { bookingCode: "18SE-1042", utr: "483910293015" },
      null,
    );

    expect(result.ok).toBe(false);
  });
});

describe("getPassCatalogue", () => {
  it("fails closed when Supabase errors rather than quoting constants", async () => {
    state.passQuery = { data: null, error: { message: "connection refused" } };
    await expect(getPassCatalogue()).resolves.toBeNull();
  });

  it("fails closed when the catalogue comes back empty", async () => {
    state.passQuery = { data: [], error: null };
    await expect(getPassCatalogue()).resolves.toBeNull();
  });
});
