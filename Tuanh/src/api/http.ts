import axios from "axios";

const http = axios.create({
  baseURL: "https://your-api-base-url.com",
  timeout: 5000,
});

export default http;
