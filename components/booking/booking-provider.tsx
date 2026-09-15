"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { BookingStep, CreatedBooking, PassOption } from "@/lib/booking/types";
import type { DetailsInput } from "@/lib/booking/schema";

/**
 * One controller for every booking entry point — header CTA, mobile menu, hero,
 * pass blocks, final CTA. They all call `open()`; none of them own state.
 *
 * Reset policy (deliberate):
 *  - Closing mid-flow KEEPS everything. A mis-tap on the backdrop after typing
 *    your details should not cost you the form.
 *  - Reopening after a confirmed booking STARTS FRESH, so the next guest doesn't
 *    land inside someone else's confirmation.
 *  - `open(passKey)` always moves the selection to that pass, so clicking a
 *    specific pass block preselects it even if the sheet was used before.
 */

type DraftDetails = Partial<DetailsInput>;

type BookingContextValue = {
  previewMode: boolean;
  catalogueUnavailable: boolean;
  isOpen: boolean;
  step: BookingStep;
  passes: PassOption[];
  passKey: string | null;
  quantity: number;
  draft: DraftDetails;
  booking: CreatedBooking | null;
  busy: boolean;
  open: (passKey?: string) => void;
  close: () => void;
  goTo: (step: BookingStep) => void;
  selectPass: (passKey: string) => void;
  setQuantity: (quantity: number) => void;
  saveDraft: (values: DraftDetails) => void;
  setBooking: (booking: CreatedBooking) => void;
  setBusy: (busy: boolean) => void;
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({
  passes,
  previewMode,
  catalogueUnavailable = false,
  children,
}: {
  passes: PassOption[];
  /** True while Supabase is unconfigured — nothing is persisted. */
  previewMode: boolean;
  /** True when the live catalogue could not be read; booking is disabled. */
  catalogueUnavailable?: boolean;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<BookingStep>("pass");
  const [passKey, setPassKey] = useState<string | null>(null);
  const [quantity, setQuantityState] = useState(1);
  const [draft, setDraft] = useState<DraftDetails>({});
  const [booking, setBookingState] = useState<CreatedBooking | null>(null);
  const [busy, setBusy] = useState(false);

  const open = useCallback(
    (nextPassKey?: string) => {
      setIsOpen(true);

      // Previous booking finished — start a clean one.
      if (booking) {
        setBookingState(null);
        setDraft({});
        setQuantityState(1);
        setPassKey(nextPassKey ?? null);
        setStep(nextPassKey ? "details" : "pass");
        return;
      }

      if (nextPassKey) {
        setPassKey(nextPassKey);
        setStep("details");
        return;
      }

      setStep(passKey ? "details" : "pass");
    },
    [booking, passKey],
  );

  const close = useCallback(() => {
    // Never trap someone mid-submit.
    if (busy) return;
    setIsOpen(false);
  }, [busy]);

  const selectPass = useCallback((next: string) => setPassKey(next), []);
  const setQuantity = useCallback(
    (next: number) => setQuantityState(Math.min(Math.max(next, 1), 10)),
    [],
  );
  const saveDraft = useCallback(
    (values: DraftDetails) => setDraft((prev) => ({ ...prev, ...values })),
    [],
  );
  const setBooking = useCallback((next: CreatedBooking) => setBookingState(next), []);

  const value = useMemo<BookingContextValue>(
    () => ({
      previewMode,
      catalogueUnavailable,
      isOpen,
      step,
      passes,
      passKey,
      quantity,
      draft,
      booking,
      busy,
      open,
      close,
      goTo: setStep,
      selectPass,
      setQuantity,
      saveDraft,
      setBooking,
      setBusy,
    }),
    [
      previewMode,
      catalogueUnavailable,
      isOpen,
      step,
      passes,
      passKey,
      quantity,
      draft,
      booking,
      busy,
      open,
      close,
      selectPass,
      setQuantity,
      saveDraft,
      setBooking,
    ],
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used inside <BookingProvider>");
  return ctx;
}

/** The currently selected pass, or null. */
export function useSelectedPass() {
  const { passes, passKey } = useBooking();
  return passes.find((p) => p.key === passKey) ?? null;
}
