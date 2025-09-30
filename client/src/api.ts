import axios from "axios";

const getBaseURL = () => {
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return "/api/portfolios";
  }
  return "http://localhost:8080/api/portfolios";
};

const api = axios.create({
  baseURL: getBaseURL(),
});

export default api;