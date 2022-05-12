const axios = require("axios").default;
const { LATAM_CONFIG } = require("../configs/latam");

const latamAuthService = axios.create({
  baseURL: "https://auth.latamgateway.com",
});

const latamCheckoutService = axios.create({
  baseURL: "https://latamgateway.com/api/v1/checkout",
});

async function latamAuth() {
  const response = await latamAuthService.post("/token", {
    email: LATAM_CONFIG.email,
    password: LATAM_CONFIG.password,
  });

  const { token } = response.data;

  latamCheckoutService.interceptors.request.use(function (config) {
    config.headers.ACCOUNT_TOKEN = token;
    return config;
  });
}

async function latamCheckout(data) {
  await latamAuth();

  return latamCheckoutService.post("/form", data);
}

module.exports = {
  latamCheckout,
};
