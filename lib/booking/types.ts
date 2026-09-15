export type BookingStep = "pass" | "details" | "payment" | "confirmation";

export type PassOption = {
  key: string;
  name: string;
  price: number;
  strikePrice: number | null;
  note: string;
  featured: boolean;
  soldOut?: boolean;
};

export type CreatedBooking = {
  bookingCode: string;
  amount: number;
  passName: string;
  quantity: number;
};

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };
