export default () => ({
  port: parseInt(process.env.PORT || "3000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  database: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "",
    name: process.env.DB_NAME,
    ssl: process.env.DB_SSL === "true",
  },
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    password: process.env.REDIS_PASSWORD || undefined,
    tls: process.env.REDIS_TLS === "true",
  },
  websocket: {
    port: parseInt(process.env.WS_PORT || "3001", 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET || "supersecret",
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  },
  throttler: {
    ttl: 60,
    limit: 100,
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    projectId: process.env.SUPABASE_PROJECT_ID,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    publishableKey: process.env.SUPABASE_PUBLISHABLE_KEY,
    secretKey: process.env.SUPABASE_SECRET_KEY,
  },
});
