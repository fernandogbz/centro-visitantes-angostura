const jwt = require('jsonwebtoken');
const { defaultClientMainFields } = require('vite');

const verificarAdmin = ( req, res, next) => {
    try{
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')){
            return res.status(401).json({ 
                error: 'Token no proporcionado',
                code : 'NO_TOKEN'
            })
            
        }

        req.user = decoded;
        next();
    } catch (error){
        if(error.name === 'TokenExpiredError') {
            return  res.status(401).json({
                error: 'Token expirado',
                code: 'TOKEN_EXPIRED'
            });
        }
        
        return res.status(401).json({
            error: 'Token inválido',
            code : 'INVALID_TOKEN'
        });
    }
};

export default verificarAdmin;