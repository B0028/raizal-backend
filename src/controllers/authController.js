import 'dotenv/config'; 
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import usuarios from "../data/users.js";


const JWT_SECRET = process.env.JWT_SECRET;

export const register = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({
                error: "Todos los campos son obligatorios"
            });
        }

        const usuarioExiste = usuarios.find(
            usuario => usuario.email === email
        );

        if (usuarioExiste) {
            return res.status(400).json({
                error: "El correo ya está registrado"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const nuevoUsuario = {
            id: Date.now(),
            email,
            password: hashedPassword,
            name
        };

        usuarios.push(nuevoUsuario);

        res.status(201).json({
            message: "Usuario registrado con éxito"
        });

    } catch (error) {
        res.status(500).json({
            error: "Error al registrar"
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const usuario = usuarios.find(
            usuario => usuario.email === email
        );

        if (
            !usuario ||
            !(await bcrypt.compare(password, usuario.password))
        ) {
            return res.status(401).json({
                error: "Credenciales incorrectas"
            });
        }

        const token = jwt.sign(
            {
                id: usuario.id,
                email: usuario.email
            },
            JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        res.json({
            token,
            user: {
                id: usuario.id,
                email: usuario.email,
                name: usuario.name
            }
        });

    } catch (error) {
        res.status(500).json({
            error: "Error en el servidor"
        });
    }
};