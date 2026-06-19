import 'dotenv/config'; // Esto carga automáticamente las variables de tu archivo .env
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cors from 'cors';

const app = express();

// Middlewares obligatorios
app.use(express.json()); 
app.use(cors({
    origin: ['http://localhost:5173'], // Tu puerto de Vite/React
    credentials: true 
})); 

const JWT_SECRET = process.env.JWT_SECRET; // Así se extrae de forma segura

// Base de datos simulada en memoria
let usuarios = [];

// REQUISITO 1: Registro de usuario
app.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        
        // Validar que no falten campos
        if (!email || !password || (!name && req.body.hasOwnProperty('name'))) {
            return res.status(400).json({ error: "Todos los campos son obligatorios" });
        }

        const usuarioExiste = usuarios.find(u => u.email === email);
        if (usuarioExiste) {
            return res.status(400).json({ error: "El correo ya está registrado" });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const nuevoUsuario = { id: Date.now(), email, password: hashedPassword, name };
        usuarios.push(nuevoUsuario);
        
        res.status(201).json({ message: "Usuario registrado con éxito" });
    } catch (error) {
        res.status(500).json({ error: "Error al registrar" });
    }
});

// REQUISITO 2: Login y generación de JWT
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const usuario = usuarios.find(u => u.email === email);

        if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
            return res.status(401).json({ error: "Credenciales incorrectas" });
        }

        const token = jwt.sign(
            { id: usuario.id, email: usuario.email }, 
            JWT_SECRET, 
            { expiresIn: '1h' }
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
        res.status(500).json({ error: "Error en el servidor" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});