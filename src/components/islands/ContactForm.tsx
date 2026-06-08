import { useEffect, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LAMBDA_SUBMIT_URL } from "~/lib/config";

type Kind = "contact" | "testimonial";

const contactSchema = z.object({
  kind: z.literal("contact"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(7, "Enter a valid phone number"),
  message: z.string().min(1, "Message is required"),
  website: z.string().optional(),
});

const testimonialSchema = z.object({
  kind: z.literal("testimonial"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  message: z.string().min(1, "Feedback is required"),
  website: z.string().optional(),
});

type ContactValues = z.infer<typeof contactSchema>;
type TestimonialValues = z.infer<typeof testimonialSchema>;
type Values = ContactValues | TestimonialValues;

interface Props {
  kind?: Kind;
}

export default function ContactForm({ kind = "contact" }: Props) {
  const schema = kind === "contact" ? contactSchema : testimonialSchema;
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [toast, setToast] = useState<string | null>(null);

  const emptyValues = {
    kind,
    name: "",
    email: "",
    phone: "",
    message: "",
    website: "",
  } as Values;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(id);
  }, [toast]);

  const onSubmit = async (values: Values) => {
    setStatus("submitting");
    try {
      const res = await fetch(LAMBDA_SUBMIT_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus("idle");
      reset(emptyValues);
      setToast(
        kind === "contact"
          ? "Thank you! I'll be in touch shortly."
          : "Thank you! Your feedback means a lot.",
      );
    } catch {
      setStatus("error");
    }
  };

  const title = kind === "contact" ? "Get In Touch" : "Leave Feedback";
  const submitLabel = kind === "contact" ? "Send message" : "Send feedback";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-6 md:p-8 bg-white/10 backdrop-blur-xl shadow-xl space-y-4"
      noValidate
    >
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-ink text-cream-50 px-5 py-3 shadow-xl font-display text-sm md:text-base max-w-[90vw] text-center"
        >
          {toast}
        </div>
      )}

      <h3 className="font-display text-2xl md:text-3xl mb-2">{title}</h3>

      <input type="hidden" value={kind} {...register("kind" as const)} />

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-10000px",
          width: "1px",
          height: "1px",
          overflow: "hidden",
        }}
      >
        <label>
          Website
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            {...register("website")}
          />
        </label>
      </div>

      <Field label="Your name" error={errors.name?.message}>
        <input
          type="text"
          autoComplete="name"
          placeholder="Full name"
          className="form-input"
          {...register("name")}
        />
      </Field>

      <Field label="Your email" error={errors.email?.message}>
        <input
          type="email"
          autoComplete="email"
          placeholder="Email address"
          className="form-input"
          {...register("email")}
        />
      </Field>

      {kind === "contact" && (
        <Field
          label="Your phone"
          error={(errors as Record<string, { message?: string }>).phone?.message}
        >
          <input
            type="tel"
            autoComplete="tel"
            placeholder="Phone number"
            className="form-input"
            {...register("phone" as keyof Values)}
          />
        </Field>
      )}

      <Field
        label={kind === "contact" ? "Your message" : "Your feedback"}
        error={errors.message?.message}
      >
        <textarea
          rows={4}
          placeholder={kind === "contact" ? "Your message…" : "Your feedback…"}
          className="form-input resize-y"
          {...register("message")}
        />
      </Field>

      <div className="flex items-center justify-center gap-3">
        {status === "error" && (
          <span className="text-sm text-brown">
            Could not send — please try again.
          </span>
        )}
        <button
          type="submit"
          className="bg-ink text-cream-50 font-display uppercase tracking-wide px-5 py-2 hover:bg-brown transition-colors disabled:opacity-60"
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "Sending…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wider text-ink-muted mb-1">
        {label}
      </span>
      {children}
      {error && <span className="block text-xs text-brown mt-1">{error}</span>}
    </label>
  );
}
