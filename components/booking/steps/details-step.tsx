"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Minus, Plus } from "lucide-react";
import { createBooking } from "@/app/actions/booking";
import { detailsSchema, type DetailsInput } from "@/lib/booking/schema";
import { useBooking, useSelectedPass } from "@/components/booking/booking-provider";
import { Field } from "@/components/ui/field";
import { CtaButton } from "@/components/ui/cta";
import { formatINR } from "@/lib/utils";

export function DetailsStep() {
  const { passKey, quantity, setQuantity, draft, saveDraft, goTo, setBooking, setBusy } =
    useBooking();
  const pass = useSelectedPass();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<DetailsInput>({
    resolver: zodResolver(detailsSchema),
    defaultValues: {
      passKey: passKey ?? "",
      quantity,
      customerName: draft.customerName ?? "",
      phone: draft.phone ?? "",
      email: draft.email ?? "",
      instagram: draft.instagram ?? "",
      specialRequest: draft.specialRequest ?? "",
    },
  });

  if (!pass) return null;
  const total = pass.price * quantity;

  async function onSubmit(values: DetailsInput) {
    setFormError(null);
    setBusy(true);
    saveDraft(values);

    const result = await createBooking({ ...values, passKey, quantity });
    setBusy(false);

    if (!result.ok) {
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) setError(field as keyof DetailsInput, { message: messages[0] });
        }
      }
      setFormError(result.error);
      return;
    }

    setBooking(result.data);
    goTo("payment");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
      {/* Order summary */}
      <div className="border-line flex flex-col gap-3 border p-4">
        <div className="flex items-center justify-between">
          <span className="label-micro text-ink">{pass.name}</span>
          <button
            type="button"
            className="label-micro hover:text-gold-hi underline-offset-4 transition-colors duration-200 hover:underline"
            onClick={() => goTo("pass")}
          >
            Change
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <QuantityButton
              label="Decrease quantity"
              onClick={() => setQuantity(quantity - 1)}
              disabled={quantity <= 1}
            >
              <Minus size={13} strokeWidth={2} />
            </QuantityButton>
            <span className="min-w-7 text-center font-sans text-lg" aria-live="polite">
              {quantity}
            </span>
            <QuantityButton
              label="Increase quantity"
              onClick={() => setQuantity(quantity + 1)}
              disabled={quantity >= 10}
            >
              <Plus size={13} strokeWidth={2} />
            </QuantityButton>
            <span className="text-ink-dim font-sans text-[13px]">
              × {formatINR(pass.price)}
            </span>
          </div>
          <span className="font-sans text-xl">{formatINR(total)}</span>
        </div>
      </div>

      <p className="label-micro">Your details</p>

      <Field label="Full name" error={errors.customerName?.message}>
        {(p) => <input {...p} {...register("customerName")} placeholder="Enter your full name" autoComplete="name" />}
      </Field>

      <Field label="Mobile number" error={errors.phone?.message} prefix="+91">
        {(p) => (
          <input
            {...p}
            {...register("phone")}
            type="tel"
            inputMode="numeric"
            placeholder="98765 43210"
            autoComplete="tel-national"
          />
        )}
      </Field>

      <Field label="Email address" error={errors.email?.message}>
        {(p) => (
          <input
            {...p}
            {...register("email")}
            type="email"
            inputMode="email"
            placeholder="you@example.com"
            autoComplete="email"
          />
        )}
      </Field>

      <Field
        label="Instagram"
        error={errors.instagram?.message}
        hint="Optional — helps us recognise you on the guest list."
      >
        {(p) => <input {...p} {...register("instagram")} placeholder="@yourhandle" />}
      </Field>

      {formError && (
        <p role="alert" className="font-sans text-[var(--text-caption)] text-red-400">
          {formError}
        </p>
      )}

      <CtaButton type="submit" variant="solid" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Starting…" : "Continue →"}
      </CtaButton>

      <p className="text-ink-dim font-sans text-[13px] leading-relaxed">
        Your booking is not confirmed until we verify your payment. Entry is strictly
        21+ and a valid photo ID is required at the door.
      </p>
    </form>
  );
}

function QuantityButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="border-line hover:border-gold flex size-8 items-center justify-center rounded-full border transition-colors duration-200 disabled:opacity-35 disabled:hover:border-[color:var(--color-line)]"
    >
      {children}
    </button>
  );
}
