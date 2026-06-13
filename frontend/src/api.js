export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function readError(response) {
  try {
    const data = await response.json();
    if (Array.isArray(data.detail)) {
      return data.detail
        .map((item) => item.msg || item.message || "Validation error")
        .join(" ");
    }
    return data.detail || data.message || "Request failed.";
  } catch {
    return `Request failed with status ${response.status}.`;
  }
}

async function requestJson(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json();
}

export function createVolunteer(payload) {
  return requestJson("/api/volunteers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function listVolunteers(filters = {}, signal) {
  const params = new URLSearchParams();
  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }
  if (filters.role) {
    params.set("role", filters.role);
  }

  const query = params.toString();
  return requestJson(`/api/volunteers${query ? `?${query}` : ""}`, { signal });
}

export function updateVolunteerStatus(id, status) {
  return requestJson(`/api/volunteers/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function requestCertificate(id) {
  const response = await fetch(
    `${API_BASE_URL}/api/volunteers/${id}/generate-certificate`,
    { method: "POST" },
  );

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response;
}
