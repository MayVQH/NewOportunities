import { getConnection,sql } from "../config/database.js";

export const getAllThemes = async (req,res) => {
    try {
        const conn = await getConnection();
        const result =await conn.request()
        .query(`SELECT t.id,
                t.nombre,
                t.hora_creacion,
                t.flag,
                (
                    SELECT                     
                    STRING_AGG(p.texto, '|||') WITHIN GROUP (ORDER BY p.hora_creacion)
                    FROM PreguntasTema p
                    WHERE p.tema_id = t.id AND p.flag = 1
                ) AS preguntas,

                (
                    SELECT                     
                    STRING_AGG(CAST(p.id AS NVARCHAR(36)), '|||') WITHIN GROUP (ORDER BY p.hora_creacion) 
                    FROM PreguntasTema p
                    WHERE p.tema_id = t.id AND p.flag = 1
                ) AS preguntas_id
                FROM Temas t
                WHERE t.flag = 1
                ORDER BY t.hora_creacion DESC
            `);
            //console.log('Temas body',result)
            const themesWithQuestions = result.recordset.map(theme => ({
                ...theme,
                preguntas: theme.preguntas ? theme.preguntas.split('|||') : [],
                preguntas_id : theme.preguntas_id ? theme.preguntas_id.split('|||') : []
            }));
        res.json(themesWithQuestions);
        console.log('resultadoparaobtenertemas',themesWithQuestions)
    } catch (error) {
        console.error('Error en la base de datos:', error);
        res.status(500).json({ 
            message: 'Error obteniendo temas',
            details: error.message 
        });
    }
};

export const getAllThemesIndistict = async (req,res) => {
    try {
        const conn = await getConnection();
        const result =await conn.request()
        .query(`SELECT t.id,
                t.nombre,
                t.hora_creacion,
                t.flag,
                (
                    SELECT STRING_AGG(p.texto, '|||') WITHIN GROUP (ORDER BY p.hora_creacion)
                    FROM PreguntasTema p
                    WHERE p.tema_id = t.id 
                ) AS preguntas
                FROM Temas t
                ORDER BY t.hora_creacion DESC
            `);
            //console.log('Temas body',result)
            const themesWithQuestions = result.recordset.map(theme => ({
                ...theme,
                preguntas: theme.preguntas ? theme.preguntas.split('|||') : []
            }));
        res.json(themesWithQuestions);
    } catch (error) {
        console.error('Error en la base de datos:', error);
        res.status(500).json({ 
            message: 'Error obteniendo temas',
            details: error.message 
        });
    }
};

export const updateMultipleThemes = async (req, res) => {
    console.log('Obteniendo temas',req.body);
    let transaction;
    const conn = await getConnection();

    try {
        const { themes } = req.body;
        console.log('Temas a actualizar:', themes);

        transaction = new sql.Transaction(conn);
        await transaction.begin();

        for (const theme of themes) {
            const {flag, id, nombre, preguntas} = theme;

            // Actualiza el nombre y flag del tema
            await new sql.Request(transaction)
                .input('id', sql.UniqueIdentifier, id)
                .input('nombre', sql.NVarChar, nombre)
                .input('flag', sql.Bit, flag)
                .query(`
                    UPDATE Temas 
                    SET nombre = @nombre, flag = @flag 
                    WHERE id = @id
                `);

            if (flag == true || flag == 1) {
                await new sql.Request(transaction)
                    .input('tema_id', sql.UniqueIdentifier, id)
                    .query(`
                        UPDATE PreguntasTema 
                        SET flag = 1 
                        WHERE tema_id = @tema_id
                    `);
            }
        }

        await transaction.commit();
        res.status(200).json({ message: 'Temas actualizados correctamente' });

    } catch (error) {
        if (transaction && transaction._begun) {
            await transaction.rollback();
        }
        console.error('Error en la base de datos:', error);
        res.status(500).json({ 
            message: 'Error al activar el tema',
            details: error.message
        });
    }
};

    export const getThemeQuestions = async (req, res) => {
        try {
            const conn = await getConnection();
            const result = await conn.request()
                .input('id', sql.UniqueIdentifier, req.params.id)
                .query('SELECT texto FROM PreguntasTema WHERE tema_id = @id');
            
            //console.log('respuesta',result)
            res.json(result);
        } catch (error) {
            console.error('Error en la base de datos:', error);
            res.status(500).json({ 
                message: 'Error obteniendo preguntas',
                details: error.message 
            });
        }
    }


  export const createTheme = async (req, res) => {
    
    let transaction;
    const conn = await getConnection();

    try {

        const {nombre,preguntas} = req.body;

        if(!nombre || !preguntas){
            return res.status(400).json({message:'Requiere todos los campos de nombre y preguntas'});
        }

        const filteredQuestions = preguntas.filter(q => q.trim() !== '');
        if (filteredQuestions.length === 0) {
            return res.status(400).json({ message: 'Debe incluir al menos una pregunta válida' });
        }

        transaction = new sql.Transaction(conn)
        await transaction.begin()
        
        
        const themeResult = await new sql.Request(transaction)
            .input('nombre', sql.NVarChar, nombre)
            .query('INSERT INTO Temas (nombre) OUTPUT inserted.id VALUES (@nombre)');
        
        const themeId = themeResult.recordset[0].id;

        for (const pregunta of filteredQuestions) {
            await new sql.Request(transaction)
                .input('tema_id', sql.UniqueIdentifier, themeId)
                .input('texto', sql.NVarChar, pregunta)
                .query('INSERT INTO PreguntasTema (tema_id, texto) VALUES (@tema_id, @texto)');
        }

        await transaction.commit();

        const completeTheme = await conn.request()
            .input('id', sql.UniqueIdentifier, themeId)
            .query(`
                SELECT t.id, t.nombre, t.hora_creacion,
                       STRING_AGG(p.texto, '|||') AS preguntas
                FROM Temas t
                JOIN PreguntasTema p ON t.id = p.tema_id
                WHERE t.id = @id AND p.flag = 1
                GROUP BY t.id, t.nombre, t.hora_creacion
            `);
        
            if (!completeTheme.recordset[0]) {
                throw new Error('No se pudo recuperar el tema creado');
            }
       
            res.status(201).json({
                ...completeTheme.recordset[0],
                preguntas: completeTheme.recordset[0].preguntas?.split('|||') || []
            });

    } catch (error) {
        if (transaction && transaction._begun) {
            await transaction.rollback();
        }
        console.error('Error en la base de datos:', error);
        res.status(500).json({ 
        message: 'Error al crear el tema',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    }
  };

export const updateTheme = async (req, res) => {
    let transaction;
    const conn = await getConnection();

    try {
        const {id} = req.params;
        const {nombre, activeQuestions, inactiveQuestions} = req.body;

        //console.log('body',req.body)
        //console.log('activas',activeQuestions)
        //console.log('inactivas',inactiveQuestions)

        transaction = new sql.Transaction(conn);
        await transaction.begin();

        // Update theme name
        await new sql.Request(transaction)
            .input('id', sql.UniqueIdentifier, id)
            .input('nombre', sql.NVarChar, nombre)
            .query('UPDATE Temas SET nombre = @nombre WHERE id = @id');

        // Get current questions
        const currentQuestions = await new sql.Request(transaction)
            .input('tema_id', sql.UniqueIdentifier, id)
            .query('SELECT id, texto, flag FROM PreguntasTema WHERE tema_id = @tema_id');

        // Process all questions (active + inactive)
        const allQuestions = [...activeQuestions, ...inactiveQuestions];
        
        for (const question of allQuestions) {
            const existingQuestion = currentQuestions.recordset.find(q => 
                q.id === question.id || q.texto.trim() === question.text.trim()
            );
            
            if (existingQuestion) {
                // Update existing question
                const isActive = activeQuestions.some(q => 
                    (q.id && q.id === existingQuestion.id) || 
                    q.text.trim() === existingQuestion.texto.trim()
                );

                await new sql.Request(transaction)
                    .input('id', sql.UniqueIdentifier, existingQuestion.id)
                    .input('flag', sql.Bit, isActive ? 1 : 0)
                    .query('UPDATE PreguntasTema SET  flag = @flag WHERE id = @id');

            } else {
                // Insert new question
                const isActive = activeQuestions.some(q => q.text.trim() === question.text.trim());
                await new sql.Request(transaction)
                    .input('tema_id', sql.UniqueIdentifier, id)
                    .input('texto', sql.NVarChar, question.text.trim())
                    .input('flag', sql.Bit, isActive ? 1 : 0)
                    .query('INSERT INTO PreguntasTema (tema_id, texto, flag) VALUES (@tema_id, @texto, @flag)');
            }

            if (existingQuestion) {
                // Update existing question
                await new sql.Request(transaction)
                    .input('id', sql.UniqueIdentifier, existingQuestion.id)
                    .input('texto',sql.NVarChar,question.text.trim())
                    .query('UPDATE PreguntasTema SET texto = @texto WHERE id = @id');
                    
            } 
        }

        await transaction.commit();

        // Return updated theme
        const updatedTheme = await conn.request()
            .input('id', sql.UniqueIdentifier, id)
            .query(`
                SELECT 
                    t.id,
                    t.nombre,
                    t.hora_creacion,
                    STRING_AGG(p.texto, '|||') AS preguntas
                FROM Temas t
                JOIN PreguntasTema p ON t.id = p.tema_id
                WHERE t.id = @id AND p.flag = 1
                GROUP BY t.id, t.nombre, t.hora_creacion
            `);

        res.status(200).json({
            ...updatedTheme.recordset[0],
            preguntas: updatedTheme.recordset[0].preguntas?.split('|||') || []
        });

    } catch (error) {
        if (transaction && transaction._begun) {
            await transaction.rollback();
        }
        console.error('Error en la base de datos 2:', error);
        res.status(500).json({ 
            message: 'Error al actualizar el tema',
            details: error.message
        });
    }
};

  export const getFullThemeData = async (req,res) => {
    try {
        const conn = await getConnection();
        //const {id} = req.params;

        const themeResult =  await conn.request()
            .input('id', sql.UniqueIdentifier, req.params.id)
            .query('SELECT id, nombre FROM Temas WHERE id = @id AND flag = 1');

        //console.log('temas:',themeResult)
        
        if (!themeResult.recordset[0]){
            return res.status(404).json({message: 'Tema no encontrado'});
        }

        const questionsResult = await conn.request()
            .input('tema_id', sql.UniqueIdentifier,req.params.id)
            .query(`
                    SELECT 
                        id, 
                        texto, 
                        flag 
                    FROM PreguntasTema 
                    WHERE tema_id = @tema_id
                    ORDER BY hora_creacion DESC
                `);
        
        //console.log(questionsResult)
        const activeQuestions = questionsResult.recordset
            .filter(q => q.flag == 1)
            .map(q => ({ id: q.id, text: q.texto }));
        
        //console.log('preguntas activas',activeQuestions)

        const inactiveQuestions = questionsResult.recordset
            .filter(q => q.flag == 0)
            .map(q => ({ id: q.id, text: q.texto }));

        //7console.log('preguntas inactivas',inactiveQuestions)
        
        res.json({
            id: themeResult.recordset[0].id,
            nombre: themeResult.recordset[0].nombre,
            activeQuestions,
            inactiveQuestions
        });

    }catch (error) {
        console.error('Error en la base de datos:', error);
        res.status(500).json({
            message: 'Error obteniendo los temas',
            details: error.message
        });
    }
  };
  
  export const deleteTheme = async (req, res) => {

    try {
        const pool = await getConnection();
        const transaction = new sql.Transaction(pool);
        await transaction.begin()

        const themeResult = await new sql.Request(transaction)
        .input('id', sql.UniqueIdentifier, req.params.id)
        .query('UPDATE Temas SET flag = 0 WHERE id = @id')

        if (themeResult.rowsAffected[0] === 0) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Tema no encontrado' });
        }


        await new sql.Request(transaction)
            .input('tema_id', sql.UniqueIdentifier, req.params.id)
            .query('UPDATE PreguntasTema SET flag = 0 WHERE tema_id = @tema_id');

        await transaction.commit();

        res.status(200).json({
            message: 'Temas y preguntas relacionadas desactivadas correctamente',
            id: req.params.id
        });
    } catch (error) {
        if (transaction && transaction._begun) {
            await transaction.rollback();
        }
        console.error('Database Error:', error);
        res.status(500).json({ 
            message: 'Error al eliminar el tema',
            details: error.message 
        });
    }

};

export const getRoles = async (req, res) => {
    try {
        const conn = await getConnection();

        const result =await conn.request()
        .query(`SELECT t.id as idTipo,
                t.nombreTipo,
                u.id as idUsuario,
                u.Nombre
                FROM Usuarios u
                JOIN tipoUsuarios t
                ON u.tipoId = t.id
            `);
            res.status(200).json(
                result
            );
} catch (error) {
    console.error('Error en la base de datos:', error);
    res.status(500).json({ 
        message: 'Error obteniendo usuarios',
        details: error.message 
    });
}
    }
    
export const updateRol = async (req, res) => {
        let transaction;
        const conn = await getConnection();
    
        try {
            const {idUsuario,id} = req.params;
    
            transaction = new sql.Transaction(conn);
            await transaction.begin();
    
            // Update theme name
            await new sql.Request(transaction)
                .input('idUsuario', sql.UniqueIdentifier, idUsuario)
                .input('idTipo', sql.UniqueIdentifier, id)
                .query('UPDATE Usuarios SET tipoId = @idTipo WHERE id = @idUsuario');
    
            await transaction.commit();

            res.status(200).json({
                message:'Modificacion exitosa'
            });
    
        } catch (error) {
            if (transaction && transaction._begun) {
                await transaction.rollback();
            }
            console.error('Database Error:', error);
            res.status(500).json({ 
                message: 'Error al actualizar el usuario',
                details: error.message
            });
        }

}

export const createKeyQuestion = async (req, res) => {
    let transaction;
    const conn = await getConnection();

    try {

        console.log('estamos en esta función de crear la pregunta clave')
        console.log('respuesta obtenida desde el front',req.body)

        const preguntaClave = req.body.nombrePreguntaClave
        const usuarios = req.body.usuarios
        const preguntaTema = req.body.preguntasPorTema

        console.log('preguntaclave',preguntaClave)
        console.log('usuarios',usuarios)
        console.log('temas y preguntas',preguntaTema)

        if(!preguntaClave || !usuarios || !preguntaTema){
            return res.status(400).json({message:'Requiere todos los campos de nombre, usuarios y preguntas'});
        }

        const filteredQuestions = preguntaTema.filter(q => q !== '');
        if (filteredQuestions.length === 0) {
            return res.status(400).json({ message: 'Debe incluir al menos una pregunta' });
        }

        const filteredUsers = usuarios.filter(q => q !== '');
        if (filteredUsers.length === 0) {
            return res.status(400).json({ message: 'Debe incluir al menos un usuario' });
        }

        transaction = new sql.Transaction(conn)
        await transaction.begin()


        

    } catch (error) {
        if (transaction && transaction._begun) {
            await transaction.rollback();
        }
        console.error('Database Error:', error);
        res.status(500).json({ 
            message: 'Error al actualizar el usuario',
            details: error.message
        });
    }

    

}


