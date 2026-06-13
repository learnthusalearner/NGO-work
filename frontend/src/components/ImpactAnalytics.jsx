import { RefreshCw, TrendingUp, UsersRound } from "lucide-react";

import { DURATIONS, ROLES } from "../constants";

export default function ImpactAnalytics({ volunteers, error, onRefresh }) {
  const total = volunteers.length;
  const completed = volunteers.filter(
    (volunteer) => volunteer.status === "Completed",
  ).length;
  const active = total - completed;
  const roleCounts = ROLES.map((role) => ({
    label: role,
    count: volunteers.filter((volunteer) => volunteer.role === role).length,
  }));
  const durationCounts = DURATIONS.map((duration) => ({
    label: duration,
    count: volunteers.filter((volunteer) => volunteer.duration === duration).length,
  }));

  return (
    <section className="grid gap-6">
      {error && (
        <div className="rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Total Volunteers" value={total} tone="green" />
        <MetricCard label="Active" value={active} tone="teal" />
        <MetricCard label="Completed" value={completed} tone="gold" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartPanel
          title="Role Distribution"
          icon={UsersRound}
          rows={roleCounts}
          accent="bg-foundation-green"
        />
        <ChartPanel
          title="Duration Distribution"
          icon={TrendingUp}
          rows={durationCounts}
          accent="bg-foundation-gold"
        />
      </div>

      <div>
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex min-h-11 items-center gap-2 rounded border border-stone-300 bg-white px-4 text-sm font-bold text-stone-700 transition hover:bg-stone-50"
        >
          <RefreshCw size={17} aria-hidden="true" />
          Refresh Analytics
        </button>
      </div>
    </section>
  );
}

function MetricCard({ label, value, tone }) {
  const toneClasses = {
    green: "border-emerald-200 bg-emerald-50 text-emerald-800",
    teal: "border-cyan-200 bg-cyan-50 text-cyan-800",
    gold: "border-amber-200 bg-amber-50 text-amber-800",
  };

  return (
    <article className={`rounded border p-5 shadow-panel ${toneClasses[tone]}`}>
      <p className="text-sm font-bold uppercase">{label}</p>
      <p className="mt-3 text-4xl font-black">{value}</p>
    </article>
  );
}

function ChartPanel({ title, icon: Icon, rows, accent }) {
  const max = Math.max(1, ...rows.map((row) => row.count));

  return (
    <article className="rounded border border-stone-200 bg-white p-5 shadow-panel">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded bg-stone-100 text-foundation-ink">
          <Icon size={20} aria-hidden="true" />
        </span>
        <h2 className="text-lg font-bold text-foundation-ink">{title}</h2>
      </div>

      <div className="grid gap-4">
        {rows.map((row) => (
          <div key={row.label} className="grid gap-2">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold text-stone-700">{row.label}</span>
              <span className="font-bold text-foundation-ink">{row.count}</span>
            </div>
            <div className="h-3 overflow-hidden rounded bg-stone-100">
              <div
                className={`h-full rounded ${accent}`}
                style={{ width: `${(row.count / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
