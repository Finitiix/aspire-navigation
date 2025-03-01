// src/polyfills.js
if (!globalThis.crypto) {
  // Import Node's crypto and set global crypto to its webcrypto instance
  const { webcrypto } = require('crypto');
  globalThis.crypto = webcrypto;
}

