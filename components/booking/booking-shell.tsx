"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useBooking } from "@/components/booking/booking-provider";
import { BookingSteps } from "@/components/booking/booking-steps";
import { cn } from "@/lib/utils";

/**
 * One dialog, two presentations: a bottom sheet under md, a centred panel above.
 * Radix gives focus trapping, focus restoration, Escape, `aria-modal` and the
 * inert background for free — worth the 12 KB over hand-rolling it wrong.
 *
 * Deliberately quieter than the marketing page: the booking UI is a form, and
 * the spec asks it to read as one.
 */
export function BookingShell() {
  const { isOpen, close, step, busy } = useBooking();

  // Backdrop dismissal is safe only before anything has been typed. After that
  // a stray tap outside would throw away a half-filled form.
  const guardOutside = step !== "pass" || busy;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(next) => !next && close()}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            "fixed inset-0 z-[60] bg-black/78 backdrop-blur-[2px]",
            "data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out",
          )}
        />
        <Dialog.Content
          onPointerDownOutside={(e) => guardOutside && e.preventDefault()}
          onInteractOutside={(e) => guardOutside && e.preventDefault()}
          onEscapeKeyDown={(e) => busy && e.preventDefault()}
          aria-describedby={undefined}
          className={cn(
            "bg-surface border-line fixed z-[70] flex flex-col border",
            // Mobile: bottom sheet.
            "inset-x-0 bottom-0 max-h-[92svh] rounded-t-2xl",
            "data-[state=open]:animate-sheet-in data-[state=closed]:animate-sheet-out",
            // Desktop: centred panel.
            "md:inset-x-auto md:top-1/2 md:bottom-auto md:left-1/2 md:max-h-[88vh] md:w-full",
            "md:max-w-[34rem] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-none",
            "md:data-[state=open]:animate-panel-in md:data-[state=closed]:animate-panel-out",
          )}
        >
          <header className="border-line flex items-start justify-between border-b px-5 py-4 md:px-7 md:py-5">
            <div>
              <Dialog.Title className="type-headline text-xl md:text-2xl">
                Book Your Pass
              </Dialog.Title>
              <p className="label-micro mt-1.5">Villa After Dark</p>
            </div>
            <Dialog.Close
              className="text-ink-dim hover:text-ink -mt-1 -mr-2 p-2 transition-colors duration-200 disabled:opacity-40"
              disabled={busy}
              aria-label="Close booking"
            >
              <X size={20} strokeWidth={1.5} />
            </Dialog.Close>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <BookingSteps />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
