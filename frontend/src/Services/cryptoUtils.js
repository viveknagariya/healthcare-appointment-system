

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function strToBuffer(str) {
  return encoder.encode(str);
}

function bufferToStr(buffer) {
  return decoder.decode(buffer);
}


export async function getKey(password, salt) {
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    strToBuffer(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}


export async function encryptData(data, password) {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const salt = window.crypto.getRandomValues(new Uint8Array(16));

  const key = await getKey(password, salt);

  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    strToBuffer(JSON.stringify(data))
  );

  return {
    iv: Array.from(iv),
    salt: Array.from(salt),
    data: Array.from(new Uint8Array(encrypted)),
  };
}


export async function decryptData(encryptedObj, password) {
  const iv = new Uint8Array(encryptedObj.iv);
  const salt = new Uint8Array(encryptedObj.salt);
  const data = new Uint8Array(encryptedObj.data);

  const key = await getKey(password, salt);

  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );

  return JSON.parse(bufferToStr(decrypted));
}