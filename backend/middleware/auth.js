import jwt from 'jsonwebtoken';

export const verificarAdmin = ( req, res, next) => {
    try{
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')){
            return res.status(401).json({ 
                error: 'Token no proporcionado',
                code : 'NO_TOKEN'
            })
            
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //Validacion de Admin || !Admin
        if (decoded.role !== 'admin'){
            return res.status(403).json({
                error: 'Acceso denegado',
                code : 'FORBIDDEN'
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