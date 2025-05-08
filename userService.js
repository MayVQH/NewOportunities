import { getConnection,sql } from "../config/database.js";

export const userService = { async findOrCreateMicrosoftUser(profile) {
        console.log('Entro a la funcion')
        const pool = await getConnection();
        console.log('Paso 0')
        const transaction = new sql.Transaction(pool);
        console.log('Paso 1')
        
        try {
            await transaction.begin();
            console.log('Paso 2')
            
            // Obtener del usuario predeterminado su ID ('Usuario')
            const typeResult = await transaction.request()
                .input('nombreTipo', sql.NVarChar(80), 'Usuario')
                .query('SELECT id FROM tipoUsuarios WHERE nombreTipo = @nombreTipo');

            console.log('Paso 3')
            
            if (typeResult.recordset.length === 0) {
                throw new Error('Rol predeterminado no encontrado');
            }
            console.log('Aqui vamos')
            console.log(typeResult)

            const tipoId = typeResult.recordset[0].id;

            console.log('Paso 5')
            
            // Checar si el usuario existe
            let userResult = await transaction.request()
                .input('OAuthID', sql.VarChar(255), profile.id)
                .query('SELECT * FROM Usuarios WHERE OAuthID = @OAuthID');
            
            console.log('paso 6')

            let user;
            if (userResult.recordset.length === 0) {
                // Crear un nuevo usuario
                const createResult = await transaction.request()
                    .input('OAuthID', sql.VarChar(255), profile.id)
                    .input('Nombre', sql.NVarChar(100), profile.displayName)
                    .input('Email', sql.VarChar(255), profile._json.mail || profile._json.userPrincipalName)
                    .input('tipoId', sql.UniqueIdentifier, tipoId)

                    .query(`
                        INSERT INTO Usuarios (OAuthID, Nombre, Email, tipoId)
                        VALUES (@OAuthID, @Nombre, @Email, @tipoId)
                        SELECT @@identity
                    `);
                console.log(createResult)
                user = profile;
                console.log(user)
            } else {
                // Actualizar el usuario
                user = userResult.recordset[0];
                console.log(user)
            }

            console.log('paso 7')
            
            await transaction.commit();

            console.log('paso 8')
            console.log(user)
            return user;
        } catch (error) {
            await transaction.rollback();
            console.error('Error en la creación o busqueda de usuario:', error);
            throw error;
        }
    }
};