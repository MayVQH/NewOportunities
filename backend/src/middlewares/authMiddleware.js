import { getConnection, sql } from '../config/database.js';

export async function verifyUser(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'No autorizado' });

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const pool = await getConnection();
        const result = await pool.request()
            .input('userId', sql.UniqueIdentifier, decoded.userId)
            .query(`
                SELECT u.id, u.IsActive, t.nombreTipo as userType
                FROM Usuarios u
                JOIN tipoUsuarios t ON u.tipoId = t.id
                WHERE u.id = @userId
            `);

        if (result.recordset.length === 0 || !result.recordset[0].IsActive) {
            return res.status(403).json({ error: 'Usuario no autorizado' });
        }

        req.user = {
            id: result.recordset[0].id,
            userType: result.recordset[0].userType
        };

        next();
    } catch (error) {
        console.error('Error en verificación de usuario:', error);
        res.status(500).json({ error: 'Error de autenticación' });
    }
}

export function checkUserType(allowedTypes = []) {
    return (req, res, next) => {
        if (!allowedTypes.includes(req.user.userType)) {
            return res.status(403).json({ error: 'Acceso no autorizado para este tipo de usuario' });
        }
        next();
    };
}
