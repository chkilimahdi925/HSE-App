export const extractItems = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];

  const candidates = [
    payload.items,
    payload.data,
    payload.results,
    payload.users,
    payload.zones,
    payload.devices,
    payload.alerts,
    payload.notifications,
    payload.observations,
    payload.audits,
    payload.trainings,
    payload.companies,
  ];

  const found = candidates.find(Array.isArray);
  return found || [];
};

export const extractCount = (payload) => {
  if (typeof payload?.count === 'number') return payload.count;
  if (typeof payload?.total === 'number') return payload.total;
  return extractItems(payload).length;
};

export const getErrorMessage = (error, fallback = 'Une erreur est survenue') => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};
