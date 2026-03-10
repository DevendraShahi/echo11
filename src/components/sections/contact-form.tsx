"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";

type FormData = {
  name: string;
  email: string;
  company: string;
  message: string;
  website: string;
};

const EMPTY_DATA: FormData = {
  name: "",
  email: "",
  company: "",
  message: "",
  website: "",
};

export function ContactForm() {
  const [formData, setFormData] = useState<FormData>(EMPTY_DATA);
  const [submitted, setSubmitted] = useState(false);
  const [hadError, setHadError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const createdAtRef = useRef(Date.now());

  const valid = useMemo(() => {
    return (
      formData.name.trim().length > 1 &&
      formData.email.includes("@") &&
      formData.message.trim().length > 12
    );
  }, [formData]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    trackEvent("form_submit_attempt", { form_id: "contact_form" });

    if (!valid) {
      setHadError(true);
      setSubmitted(false);
      return;
    }

    setSubmitting(true);
    setHadError(false);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          submittedAt: createdAtRef.current,
        }),
      });

      if (!response.ok) {
        throw new Error("Contact request failed");
      }

      trackEvent("form_submit_success", {
        form_id: "contact_form",
        latency_ms: Date.now() - createdAtRef.current,
      });

      setSubmitted(true);
      setFormData(EMPTY_DATA);
      createdAtRef.current = Date.now();
      window.dispatchEvent(
        new CustomEvent("echo11:toast", {
          detail: { text: "Message received. We reply within one business day." },
        }),
      );
    } catch {
      setHadError(true);
      setSubmitted(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      className={`contact-form ${hadError ? "is-invalid" : ""}`.trim()}
      onSubmit={handleSubmit}
      noValidate
    >
      <label className="form-field">
        <input
          type="text"
          placeholder=" "
          value={formData.name}
          onChange={(event) =>
            setFormData((current) => ({ ...current, name: event.target.value }))
          }
          required
        />
        <span>Name</span>
      </label>

      <label className="form-field">
        <input
          type="email"
          placeholder=" "
          value={formData.email}
          onChange={(event) =>
            setFormData((current) => ({ ...current, email: event.target.value }))
          }
          required
        />
        <span>Email</span>
      </label>

      <label className="form-field">
        <input
          type="text"
          placeholder=" "
          value={formData.company}
          onChange={(event) =>
            setFormData((current) => ({ ...current, company: event.target.value }))
          }
        />
        <span>Company</span>
      </label>

      <label className="form-field form-field-textarea">
        <textarea
          rows={5}
          placeholder=" "
          value={formData.message}
          onChange={(event) =>
            setFormData((current) => ({ ...current, message: event.target.value }))
          }
          required
        />
        <span>What are you building?</span>
      </label>

      <label className="form-field honeypot-field" aria-hidden="true">
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={formData.website}
          onChange={(event) =>
            setFormData((current) => ({ ...current, website: event.target.value }))
          }
        />
        <span>Website</span>
      </label>

      <button className="btn-primary mt-4" type="submit" disabled={submitting}>
        {submitting ? "Sending..." : "Send brief"}
        <span className="btn-scan" aria-hidden="true"></span>
      </button>

      {hadError ? (
        <p className="form-state form-state-error">
          Add name, valid email, and a project brief with at least 12 characters.
        </p>
      ) : null}
      {submitted ? (
        <p className="form-state form-state-success">
          Message received. We reply within one business day.
        </p>
      ) : null}
    </form>
  );
}
