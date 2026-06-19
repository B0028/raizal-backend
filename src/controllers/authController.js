import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { createUser, findUserByEmail } from "../data/userStore.js";

const JWT_SECRET = process.env.JWT_SECRET;

function requireJwtSecret() {
  if (!JWT_SECRET) {
    const err = new Error("JWT_SECRET no está configurado");
    err.status = 500;
    throw err;
  }
}

function sanitizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}


export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;


    if (!email || !password || !name) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const nuevoUsuario = createUser({
      email,
      password: hashedPassword,
      name,
    });

    if (!nuevoUsuario) {
      return res.status(400).json({ error: "El correo ya está registrado" });
    }

    return res.status(201).json({ message: "Usuario registrado con éxito" });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(error.status || 500).json({
      error: error.message || "Error al registrar",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    requireJwtSecret();

    const usuario = findUserByEmail(email);

    if (!usuario) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const passwordCorrecta = await bcrypt.compare(password, usuario.password);

    if (!passwordCorrecta) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      token,
      user: {
        id: usuario.id,
        email: usuario.email,
        name: usuario.name,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(error.status || 500).json({
      error: error.message || "Error en el servidor",
    });
  }
};
