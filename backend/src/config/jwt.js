function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return secret;
}

function assertJwtConfig() {
  getJwtSecret();
}

module.exports = { getJwtSecret, assertJwtConfig };
