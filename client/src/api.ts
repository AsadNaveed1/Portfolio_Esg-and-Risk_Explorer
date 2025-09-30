import axios from "axios";

const getBaseURL = () => {
  if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    return "/api/portfolios";
  }
  return "http://localhost:8080/api/portfolios";
};

const api = axios.create({
  baseURL: getBaseURL(),
});

export const generateCsvReport = async (portfolioId: number) => {
  const resp = await api.post(`/${portfolioId}/report/csv`);
  return resp.data;
};

export const downloadReport = async (reportId: number) => {
  const resp = await api.get(`/reports/${reportId}/download`, {
    responseType: "blob",
  });
  return resp;
};

export default api;