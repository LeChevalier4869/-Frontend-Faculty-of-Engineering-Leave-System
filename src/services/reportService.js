import { API, apiEndpoints } from "../utils/api";

export const getMonthlyReport = async ({ organizationId, month, year }) => {
  const { data } = await API.get(apiEndpoints.reportDataforMonth, {
    params: {
      organizationId,
      month,
      year,
    },
  });

  return data.data;
};

export const getOrganizations = async () => {
  const { data } = await API.get(apiEndpoints.organizationsList);
  return data.data;
};
