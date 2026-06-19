import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, "../data");
const DATA_FILE = path.join(DATA_DIR, "users.db.json");


function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify([]), "utf-8");
}

function readUsers() {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeUsers(users) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), "utf-8");
}

export function findUserByEmail(email) {
  const users = readUsers();
  const needle = String(email || "").trim().toLowerCase();
  return users.find((u) => String(u.email || "").trim().toLowerCase() === needle);
}


export function getAllUsers() {
  return readUsers();
}

export function createUser({ email, password, name }) {
  const users = readUsers();
  if (users.some((u) => u.email === email)) return null;

  const nuevoUsuario = {
    id: Date.now(),
    email,
    password,
    name,
  };

  users.push(nuevoUsuario);
  writeUsers(users);
  return nuevoUsuario;
}

