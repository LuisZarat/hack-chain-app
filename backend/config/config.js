require('dotenv').config();

function normalizeSslMode(url) {
  if (!url) return url;
  return url.replace(/sslmode=require/g, 'sslmode=verify-full');
}

const directUrl = normalizeSslMode(
  process.env.DATABASE_URL_UNPOOLED || process.env.DB_DATABASE_URL
);

const common = {
  use_env_variable: null,
  url: directUrl,
  dialect: 'postgres',
  dialectOptions: {
    ssl: { rejectUnauthorized: false },
  },
  logging: false,
};

module.exports = {
  development: common,
  test: common,
  production: common,
};

