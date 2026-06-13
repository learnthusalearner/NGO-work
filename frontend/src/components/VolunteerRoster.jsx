import {
  AlertCircle,
  CheckCircle2,
  Download,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  listVolunteers,
  requestCertificate,
  updateVolunteerStatus,
} from "../api";
import { ROLES } from "../constants";

export default function VolunteerRoster({ refreshToken, onVolunteerUpdated }) {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [action, setAction] = useState(null);
  const [localRefreshToken, setLocalRefreshToken] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const volunteers = await listVolunteers({ search, role }, controller.signal);
        setRows(volunteers);
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(requestError.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [localRefreshToken, refreshToken, role, search]);

  const handleMarkCompleted = async (volunteer) => {
    if (volunteer.status === "Completed") {
      return;
    }

    setAction({ id: volunteer.id, type: "status" });
    setError("");
    try {
      const updated = await updateVolunteerStatus(volunteer.id, "Completed");
      setRows((currentRows) =>
        currentRows.map((row) => (row.id === updated.id ? updated : row)),
      );
      onVolunteerUpdated?.(updated);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setAction(null);
    }
  };

  const handleDownload = async (volunteer) => {
    setAction({ id: volunteer.id, type: "download" });
    setError("");
    try {
      const response = await requestCertificate(volunteer.id);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      const rawFileName = `${safeFileName(volunteer.name)}_Certificate.docx`;
      anchor.download = rawFileName.replace(/\.docx?$/i, ".docs");
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setAction(null);
    }
  };

  return (
    <section className="grid gap-5">
      <div className="grid gap-3 rounded border border-stone-200 bg-white p-4 shadow-panel md:grid-cols-[1fr_260px_auto]">
        <label className="relative block">
          <Search
            size={18}
            aria-hidden="true"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by volunteer name"
            className="min-h-11 w-full rounded border border-stone-300 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-foundation-green focus:ring-2 focus:ring-emerald-100"
          />
        </label>

        <select
          value={role}
          onChange={(event) => setRole(event.target.value)}
          className="min-h-11 rounded border border-stone-300 bg-white px-3 text-sm outline-none transition focus:border-foundation-green focus:ring-2 focus:ring-emerald-100"
        >
          <option value="">All roles</option>
          {ROLES.map((roleName) => (
            <option key={roleName} value={roleName}>
              {roleName}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setLocalRefreshToken((token) => token + 1)}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded border border-stone-300 bg-white px-4 text-sm font-bold text-stone-700 transition hover:bg-stone-50"
        >
          <RefreshCw size={17} aria-hidden="true" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-800">
          <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      <div className="rounded border border-stone-200 bg-white shadow-panel">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase text-stone-500">
              <tr>
                <HeaderCell>Name</HeaderCell>
                <HeaderCell>Email</HeaderCell>
                <HeaderCell>Role</HeaderCell>
                <HeaderCell>Duration</HeaderCell>
                <HeaderCell>Joining Date</HeaderCell>
                <HeaderCell>Status</HeaderCell>
                <HeaderCell>Actions</HeaderCell>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {loading ? (
                <TableLoading />
              ) : rows.length === 0 ? (
                <TableEmpty />
              ) : (
                rows.map((volunteer) => (
                  <tr key={volunteer.id} className="align-top">
                    <BodyCell>
                      <span className="font-bold text-foundation-ink">
                        {volunteer.name}
                      </span>
                    </BodyCell>
                    <BodyCell>{volunteer.email}</BodyCell>
                    <BodyCell>{volunteer.role}</BodyCell>
                    <BodyCell>{volunteer.duration}</BodyCell>
                    <BodyCell>{volunteer.join_date}</BodyCell>
                    <BodyCell>
                      <StatusBadge status={volunteer.status} />
                    </BodyCell>
                    <BodyCell>
                      <RowActions
                        volunteer={volunteer}
                        action={action}
                        onMarkCompleted={handleMarkCompleted}
                        onDownload={handleDownload}
                      />
                    </BodyCell>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 p-3 md:hidden">
          {loading ? (
            <MobileLoading />
          ) : rows.length === 0 ? (
            <MobileEmpty />
          ) : (
            rows.map((volunteer) => (
              <article
                key={volunteer.id}
                className="grid gap-3 rounded border border-stone-200 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-foundation-ink">
                      {volunteer.name}
                    </h2>
                    <p className="break-all text-sm text-stone-600">
                      {volunteer.email}
                    </p>
                  </div>
                  <StatusBadge status={volunteer.status} />
                </div>

                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <Detail label="Role" value={volunteer.role} />
                  <Detail label="Duration" value={volunteer.duration} />
                  <Detail label="Joining Date" value={volunteer.join_date} />
                </dl>

                <RowActions
                  volunteer={volunteer}
                  action={action}
                  onMarkCompleted={handleMarkCompleted}
                  onDownload={handleDownload}
                />
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function HeaderCell({ children }) {
  return <th className="px-4 py-3 font-bold">{children}</th>;
}

function BodyCell({ children }) {
  return <td className="px-4 py-4 text-stone-700">{children}</td>;
}

function TableLoading() {
  return (
    <tr>
      <td colSpan="7" className="px-4 py-10 text-center text-stone-500">
        <Loader2 className="mx-auto mb-3 animate-spin" size={24} aria-hidden="true" />
        Loading volunteers
      </td>
    </tr>
  );
}

function TableEmpty() {
  return (
    <tr>
      <td colSpan="7" className="px-4 py-10 text-center text-stone-500">
        No volunteers found.
      </td>
    </tr>
  );
}

function MobileLoading() {
  return (
    <div className="flex min-h-32 items-center justify-center text-stone-500">
      <Loader2 className="mr-2 animate-spin" size={20} aria-hidden="true" />
      Loading volunteers
    </div>
  );
}

function MobileEmpty() {
  return (
    <div className="flex min-h-32 items-center justify-center text-sm text-stone-500">
      No volunteers found.
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase text-stone-500">{label}</dt>
      <dd className="mt-1 font-semibold text-stone-800">{value}</dd>
    </div>
  );
}

function RowActions({ volunteer, action, onMarkCompleted, onDownload }) {
  const isStatusBusy = action?.id === volunteer.id && action.type === "status";
  const isDownloadBusy = action?.id === volunteer.id && action.type === "download";
  const isCompleted = volunteer.status === "Completed";

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        disabled={isCompleted || Boolean(action)}
        onClick={() => onMarkCompleted(volunteer)}
        className="inline-flex min-h-10 items-center gap-2 rounded bg-foundation-teal px-3 text-xs font-bold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-500"
      >
        {isStatusBusy ? (
          <Loader2 className="animate-spin" size={16} aria-hidden="true" />
        ) : (
          <CheckCircle2 size={16} aria-hidden="true" />
        )}
        Mark Completed
      </button>

      <button
        type="button"
        disabled={Boolean(action)}
        onClick={() => onDownload(volunteer)}
        className="inline-flex min-h-10 items-center gap-2 rounded border border-stone-300 bg-white px-3 text-xs font-bold text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-400"
      >
        {isDownloadBusy ? (
          <Loader2 className="animate-spin" size={16} aria-hidden="true" />
        ) : (
          <Download size={16} aria-hidden="true" />
        )}
        Download Certificate
      </button>
    </div>
  );
}

function StatusBadge({ status }) {
  const classes =
    status === "Completed"
      ? "bg-sky-100 text-sky-800 border-sky-200"
      : "bg-emerald-100 text-emerald-800 border-emerald-200";

  return (
    <span
      className={`inline-flex min-h-7 items-center rounded border px-2.5 text-xs font-bold ${classes}`}
    >
      {status}
    </span>
  );
}

function safeFileName(value) {
  return value.replace(/[^a-z0-9._-]+/gi, "_").replace(/^[_\-.]+|[_\-.]+$/g, "");
}
