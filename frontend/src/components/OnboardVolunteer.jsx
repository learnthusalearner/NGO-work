import { AlertCircle, CheckCircle2, Loader2, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";

import { createVolunteer } from "../api";
import { DURATIONS, ROLES } from "../constants";

const INITIAL_FORM = {
  name: "",
  email: "",
  role: "",
  duration: "",
};

export default function OnboardVolunteer({ onVolunteerCreated }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(
    () => form.name && form.email && form.role && form.duration && !isSubmitting,
    [form, isSubmitting],
  );

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
    setNotice(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setNotice({
        type: "error",
        message: "Please correct the highlighted fields.",
      });
      return;
    }

    setIsSubmitting(true);
    setNotice(null);
    try {
      const created = await createVolunteer(form);
      onVolunteerCreated?.(created);
      setForm(INITIAL_FORM);
      setNotice({
        type: "success",
        message: `${created.name} has been added to the volunteer roster.`,
      });
    } catch (error) {
      setNotice({
        type: "error",
        message: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="max-w-3xl rounded border border-stone-200 bg-white p-5 shadow-panel sm:p-7">
      <form className="grid gap-5" onSubmit={handleSubmit} noValidate>
        {notice && <AlertBanner notice={notice} />}

        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="volunteer-name" label="Full Name" error={errors.name}>
            <input
              id="volunteer-name"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Aarav Mehta"
              className={inputClass(errors.name)}
            />
          </Field>

          <Field id="volunteer-email" label="Email" error={errors.email}>
            <input
              id="volunteer-email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="aarav@example.org"
              type="email"
              className={inputClass(errors.email)}
            />
          </Field>

          <Field id="volunteer-role" label="Role" error={errors.role}>
            <select
              id="volunteer-role"
              value={form.role}
              onChange={(event) => updateField("role", event.target.value)}
              className={inputClass(errors.role)}
            >
              <option value="">Select role</option>
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </Field>

          <Field
            id="volunteer-duration"
            label="Tenure Duration"
            error={errors.duration}
          >
            <select
              id="volunteer-duration"
              value={form.duration}
              onChange={(event) => updateField("duration", event.target.value)}
              className={inputClass(errors.duration)}
            >
              <option value="">Select duration</option>
              {DURATIONS.map((duration) => (
                <option key={duration} value={duration}>
                  {duration}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="flex justify-end border-t border-stone-200 pt-5">
          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex min-h-11 items-center gap-2 rounded bg-foundation-green px-5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-600"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={18} aria-hidden="true" />
            ) : (
              <UserPlus size={18} aria-hidden="true" />
            )}
            Add Volunteer
          </button>
        </div>
      </form>
    </section>
  );
}

function Field({ id, label, error, children }) {
  return (
    <div className="grid gap-2 text-sm font-semibold text-stone-700">
      <label htmlFor={id}>{label}</label>
      {children}
      {error && <span className="text-sm font-medium text-red-600">{error}</span>}
    </div>
  );
}

function AlertBanner({ notice }) {
  const Icon = notice.type === "success" ? CheckCircle2 : AlertCircle;
  const classes =
    notice.type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : "border-red-200 bg-red-50 text-red-800";

  return (
    <div className={`flex items-start gap-3 rounded border px-4 py-3 ${classes}`}>
      <Icon size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
      <p className="text-sm font-semibold">{notice.message}</p>
    </div>
  );
}

function validateForm(form) {
  const nextErrors = {};
  if (!form.name.trim()) {
    nextErrors.name = "Full name is required.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    nextErrors.email = "Enter a valid email address.";
  }
  if (!form.role) {
    nextErrors.role = "Select a volunteer role.";
  }
  if (!form.duration) {
    nextErrors.duration = "Select a tenure duration.";
  }
  return nextErrors;
}

function inputClass(hasError) {
  return `min-h-11 w-full rounded border bg-white px-3 text-sm text-foundation-ink outline-none transition focus:ring-2 ${
    hasError
      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
      : "border-stone-300 focus:border-foundation-green focus:ring-emerald-100"
  }`;
}
