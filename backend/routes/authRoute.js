const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//Hash para el passkey (se genera una sola vez)
const ADMIN_PASSKEY_HASH = process.env.ADMIN_PASSKEY_HASH || '$2a$10$7QjE6m1b0rYFz3v5bYc8EuX9Fh8jK1JYpZ6G8u1OqFz9JxX1YzE5K'; 

//POST /api/auth/login
router.post('/login', async (req, res)=>{
    try{
        const { passkey } = req.body;
        if (!passkey){
            return res.status(400).json({ 
                error: 'Falta el passkey',
                code : 'MISSING_PASSKEY' 
            });
        }

        //Compara el passkey con el hash almacenado
        if (!isValid){
            //Genera un log del intento fallido
            console.log(` Intento de login fallido desde IP: ${req.ip} a las ${new Date().toISOString()}`)
            return res.status(401).json({
                error: 'Passkey invalido',
                code: 'INVALID_PASSKEY'
            })
        }

        //Genera el token JWT
        const token = jwt.sign({
            role: 'admin',
            timestamp: Date.now()
            },
            process.env.JWT_SECRET,
            {expiresIn: '8h'} //Token valido por 8 horas
        );

        //Log del login exitoso
        console.log(` Login exitoso desde IP ${req.ip} a las ${new Date().toISOString()}`);
        res.json({
            success: true,
            token,
            expiresIn: '8h'
        })
    }catch (error){
        console.error('Error en login:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            code: 'INTERNAL_SERVER_ERROR'
        });
    }
});

// GET /api/auth/verify - Verifica que el token es valido 
router.get('/verify', (req, res) =>{
    try{
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith('Bearer ')){
            return res.status(401).json({
                valid : false,
                code : 'NO_TOKEN'
            })
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if(decoded.role !== 'admin') {
            return res.status(401).json({
                valid: false,
                code: 'FORBIDDEN'
            });
        }
        res.json({
            valid: true,
            role: decoded.role
        });
    }catch (error){
        if (error.name === 'TokenExpiredError'){
            return res.status(401).json({
                valid: false,
                code: 'TOKEN_EXPIRED'
            });
        }
        res.status(4001).json({
            valid: false,
            code: 'INVALID_TOKEN'
        });
    }
});

export default router;

