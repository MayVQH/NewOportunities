import { getConnection,sql } from "../config/database.js";
import { BlobServiceClient } from "@azure/storage-blob";
// Conexión a Azure Blob


import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage });


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
                u.Nombre,
                u.Email
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
        const userEmail = req.body.creador
        const usuarioElegido = req.body.usuarioElegido

        console.log('preguntaclave',preguntaClave)
        console.log('usuarios',usuarios)
        console.log('temas y preguntas',preguntaTema)
        console.log('correo',userEmail)
        console.log('usuario elegido',usuarioElegido)

        if(!preguntaClave || !usuarios || !preguntaTema){
            return res.status(400).json({message:'Requiere todos los campos de nombre, usuarios y preguntas'});
        }
        
        //
        const allQuestions = Object.values(preguntaTema).flat(); // extrae todos los arrays y los aplana
        const filteredQuestions = allQuestions.filter(q => q.trim() !== '');

        if (filteredQuestions.length === 0) {
        return res.status(400).json({ message: 'Debe incluir al menos una pregunta' });
        }

        const filteredUsers = Array.isArray(usuarios) ? usuarios.filter(u => u.trim() !== '') : [];

        if (filteredUsers.length === 0) {
        return res.status(400).json({ message: 'Debe incluir al menos un usuario' });
        }

        //

        transaction = new sql.Transaction(conn)
        await transaction.begin()

        const estado = 'Pendiente'

        const KeyQuestionResult = await new sql.Request(transaction)
            .input('nombre', sql.NVarChar, preguntaClave)
            .input('correo',sql.NVarChar,userEmail)
            .input('estado',sql.NVarChar,estado)
            .input('elegido',sql.NVarChar,usuarioElegido)
            .query('INSERT INTO PreguntasClave (nombre,creador,estado,usuarioElegido) OUTPUT inserted.id VALUES (@nombre,@correo,@estado,@elegido)');

        console.log('fila agregada',KeyQuestionResult)
        
        const KeyQuestionid = KeyQuestionResult.recordset[0].id;

        console.log('id de pregunta clave',KeyQuestionid)

        for (const user of usuarios) {
            await new sql.Request(transaction)
                .input('keyQuestion_id', sql.UniqueIdentifier, KeyQuestionid)
                .input('user', sql.UniqueIdentifier, user)
                .query('INSERT INTO UsuariosPreguntaClave (pc_id, usuario_id) VALUES (@keyQuestion_id, @user)');
        }

        for (const temas in preguntaTema) {
            const themeId = temas
            console.log('id del tema',themeId)
            
            for (const [index,pregunta] of preguntaTema[temas].entries()){
                const result = await conn.request()
                
                .input('id', sql.UniqueIdentifier, themeId)
                .input('texto',sql.NVarChar,pregunta)
                .query(`SELECT id
                        FROM PreguntasTema
                        WHERE tema_id = @id and texto = @texto
                    `);
                console.log(`Preguntas del tema${index + 1}:${pregunta}`,)
                console.log('resultado del query',result.recordset[0].id)

                await new sql.Request(transaction)
                    .input('keyQuestion_id', sql.UniqueIdentifier, KeyQuestionid)
                    .input('texto', sql.NVarChar, pregunta)
                    .input('tema_id',sql.UniqueIdentifier,themeId)
                    .input('pregunta_id',sql.UniqueIdentifier,result.recordset[0].id)
                    .query('INSERT INTO PreguntasPreguntaClave (pc_id, texto,tema_id,preguntaTema_id) VALUES (@keyQuestion_id, @texto,@tema_id,@pregunta_id)');
            }            
        }
        await transaction.commit();

        const completeTheme = await conn.request()
            .input('id', sql.UniqueIdentifier, KeyQuestionid)
            .query(`
                SELECT t.id, t.nombre, t.hora_creacion,t.estado
                FROM PreguntasClave t
                WHERE t.id = @id 
                GROUP BY t.id, t.nombre, t.hora_creacion,t.estado
            `);
        
            if (!completeTheme.recordset[0]) {
                throw new Error('No se pudo recuperar el tema creado');
            }

        res.status(201).json({
            ...completeTheme.recordset[0]
        });
    } catch (error) {
        if (transaction && transaction._begun) {
            await transaction.rollback();
        }
        console.error('Database Error:', error);
        res.status(500).json({ 
            message: 'Error al crear la pregunta clave',
            details: error.message
        });
    }
}


export const getAllKeyQuestions = async (req,res) => {
    try {
        const conn = await getConnection();
        const result =await conn.request()
        .query(`SELECT 
                    p.id,
                    p.nombre,
                    p.hora_creacion,
                    p.creador,
                    (
                        SELECT u.Nombre
                        FROM Usuarios u
                        WHERE u.Email = p.creador
                    ) AS creador_p,
                    p.decisionFinal,
                    p.comentario,
                    p.comentarioFinal,
                    p.estado               
                FROM PreguntasClave p
                WHERE p.flag = 1
                ORDER BY p.hora_creacion DESC
            `);
            console.log('Temas body',result)
            res.status(200).json(
                result
            );
    } catch (error) {
        console.error('Error en la base de datos:', error);
        res.status(500).json({ 
            message: 'Error obteniendo Preguntas clave',
            details: error.message 
        });
    }
};


export const updateComentsKeyQuestion = async (req,res) => {

    let transaction;
    const conn = await getConnection();

    try {

        const { id } = req.params;
        const { comentario } = req.body;

        console.log('comentario',comentario)

        transaction = new sql.Transaction(conn);
        await transaction.begin();

        // Update theme name
        await new sql.Request(transaction)
            .input('id', sql.UniqueIdentifier, id)
            .input('comentario', sql.NVarChar, comentario)
            .query(`
                UPDATE PreguntasClave
                SET comentario = @comentario
                WHERE id = @id
            `);
        
        await transaction.commit();

        res.status(200).json({ message: 'Comentario actualizado correctamente' });
    } catch (error) {
        console.error('Error actualizando comentario:', error);
        res.status(500).json({ error: 'Error al actualizar el comentario' });
    }
    };


export const getAllKeyQuestionUser = async (req,res) => {
    try {
        const {id} = req.params;
        console.log('id del usuario', id)
        const conn = await getConnection();

        const usuarios =await conn.request()
        .input('id',sql.UniqueIdentifier,id)
        .query(`SELECT pc_id
                FROM UsuariosPreguntaClave
                WHERE usuario_id = @id
            `);
        
        console.log('Temas body',usuarios)
        const pcIds = usuarios.recordset.map(row => `'${row.pc_id}'`).join(',');

        if (pcIds.length == 0){
            return res.json([]);
        }
        

        const result =await conn.request()
        .query(`SELECT t.id,
                t.nombre,
                t.hora_creacion,
                t.flag,
                (
                    SELECT                     
                    STRING_AGG(p.texto, '|||') WITHIN GROUP (ORDER BY p.hora_creacion)
                    FROM PreguntasPreguntaClave p
                    WHERE p.pc_id = t.id
                ) AS preguntas
                FROM PreguntasClave t
                WHERE t.id IN (${pcIds}) AND t.estado = 'Pendiente'
                ORDER BY t.hora_creacion DESC
            `);
            console.log('Temas body',result)
            const KeyQuestionWithQuestions = result.recordset.map(key => ({
                 ...key,
                 preguntas: key.preguntas ? key.preguntas.split('|||') : [],
             }));
        res.json(KeyQuestionWithQuestions);
        console.log('resultadoparaobtenerPreguntasClave',KeyQuestionWithQuestions)
    } catch (error) {
        console.error('Error en la base de datos:', error);
        res.status(500).json({ 
            message: 'Error obteniendo temas',
            details: error.message 
        });
    }
};

export const getFullKeyQuestionData = async (req,res) => {
    try {
        const conn = await getConnection();
        const {id} = req.params;

        console.log('id de la pregunta clave unica',id)
        const keyResult =  await conn.request()
            .input('id', sql.UniqueIdentifier, id)
            .query('SELECT id, nombre FROM PreguntasClave WHERE id = @id');

        console.log('temas:',keyResult)
        
        if (!keyResult.recordset[0]){
            return res.status(404).json({message: 'Pregunta clave no encontrada'});
        }

        const questionsResult = await conn.request()
            .input('pc_id', sql.UniqueIdentifier,id)
            .query(`
                    SELECT 
                        id, 
                        texto
                    FROM PreguntasPreguntaClave 
                    WHERE pc_id = @pc_id
                    ORDER BY hora_creacion DESC
                `);
        
        console.log('preguntas de la pregunta clave',questionsResult)
        
        res.json({
            id: keyResult.recordset[0].id,
            nombre: keyResult.recordset[0].nombre,
            preguntas:questionsResult.recordset
        });

    }catch (error) {
        console.error('Error en la base de datos:', error);
        res.status(500).json({
            message: 'Error obteniendo los temas',
            details: error.message
        });
    }
  };


  export const getComentsKeyQuestions = async (req,res) => {
    try {
        const conn = await getConnection();
        const {id} = req.params;

        console.log('id de la pregunta clave unica',id)

        const result =await conn.request()
        .input('id',sql.UniqueIdentifier,id)
        .query(`SELECT 
                    p.id,
                    p.pc_id,
                    p.pcp_id,
                    p.texto,
                    p.hora_creacion,
                    p.creador,
                    (
                        select u.Nombre
                        FROM Usuarios u
                        WHERE id = p.creador
                    ) as NombreUsuario,
                    p.flag                 
                FROM ComentariosPreguntasClave p
                WHERE p.pcp_id = @id
                ORDER BY p.hora_creacion DESC
            `);
            console.log('Temas body',result)
            res.status(200).json(
                result
            );
    } catch (error) {
        console.error('Error en la base de datos:', error);
        res.status(500).json({ 
            message: 'Error obteniendo comentarios Preguntas clave',
            details: error.message 
        });
    }
};

export const getComentsKeyQuestionsUser = async (req,res) => {
    try {
        const conn = await getConnection();
        const {id,user} = req.params;

        console.log('id de la pregunta clave unica',id)
        console.log('id del usuario',user)

        const result =await conn.request()
        .input('id',sql.UniqueIdentifier,id)
        .input('user',sql.UniqueIdentifier,user)
        .query(`SELECT 
                    p.id,
                    p.pc_id,
                    p.pcp_id,
                    p.texto,
                    p.hora_creacion,
                    p.creador,
                    (
                        select u.Nombre
                        FROM Usuarios u
                        WHERE id = p.creador
                    ) as NombreUsuario,
                    p.flag                 
                FROM ComentariosPreguntasClave p
                WHERE p.pcp_id = @id and p.creador = @user
                ORDER BY p.hora_creacion DESC
            `);
            console.log('Temas body',result)
            res.status(200).json(
                result
            );
    } catch (error) {
        console.error('Error en la base de datos:', error);
        res.status(500).json({ 
            message: 'Error obteniendo comentariosPreguntas clave',
            details: error.message 
        });
    }
};

export const getDocumentsKeyQuestions = async (req,res) => {
    try {
        const conn = await getConnection();
        const {id,user} = req.params;

        console.log('id de la pregunta clave unica',id)
        console.log('id del usuario',user)

        const result =await conn.request()
        .input('id',sql.UniqueIdentifier,id)
        .input('user',sql.UniqueIdentifier,user)
        .query(`SELECT 
                    p.id,
                    p.pc_id,
                    p.pcp_id,
                    p.documento,
                    p.hora_creacion,
                    p.creador,
                    (
                        select u.Nombre
                        FROM Usuarios u
                        WHERE id = p.creador
                    ) as NombreUsuario,
                    p.flag                 
                FROM DocumentosPreguntasClave p
                WHERE p.pcp_id = @id 
                ORDER BY p.hora_creacion DESC
            `);
            console.log('Temas body',result)
            res.status(200).json(
                result
            );
    } catch (error) {
        console.error('Error en la base de datos:', error);
        res.status(500).json({ 
            message: 'Error obteniendo documentos de Preguntas clave',
            details: error.message 
        });
    }
};

export const createNewComment = async (req, res) => {
    let transaction;
    const conn = await getConnection();

    try {

        console.log('estamos en esta función de crear el comentario de la pregunta de la pregunta clave')
        console.log('respuesta obtenida desde el front',req.body)

        const idpreguntaClave = req.body.pc_id
        const idpregunta = req.body.pcp_id
        const texto = req.body.texto
        const creador = req.body.creador

        console.log('preguntaclave',idpreguntaClave)
        console.log('usuarios',idpregunta)
        console.log('comentario',texto)
        console.log('correo',creador)

        if(!idpreguntaClave || !idpregunta || !texto || !creador){
            return res.status(400).json({message:'Requiere todos los campos'});
        }

        transaction = new sql.Transaction(conn)
        await transaction.begin()

        const CommentKeyQuestionResult = await new sql.Request(transaction)
            .input('idPreguntaClave', sql.UniqueIdentifier, idpreguntaClave)
            .input('idPregunta', sql.UniqueIdentifier, idpregunta)
            .input('texto',sql.NVarChar,texto)
            .input('idcreador', sql.UniqueIdentifier, creador)
            .query('INSERT INTO ComentariosPreguntasClave (pc_id,pcp_id,texto,creador) VALUES (@idPreguntaClave,@idPregunta,@texto,@idcreador)');

        await transaction.commit();
    } catch (error) {
        if (transaction && transaction._begun) {
            await transaction.rollback();
        }
        console.error('Database Error:', error);
        res.status(500).json({ 
            message: 'Error al actualizar el comentario',
            details: error.message
        });
    }
}


export const createNewDocument = async (req, res) => {
    let transaction;
    const conn = await getConnection();
    try {

        console.log('estamos en esta función de crear el documento de la pregunta de la pregunta clave')
        console.log(req.file)
        console.log('Metadata recibida:', req.body.metadata);

        const metadata = JSON.parse(req.body.metadata);
        const { pc_id, pcp_id, texto, creador } = metadata;
        
               
        const blobName = req.file.originalname;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.upload(req.file.buffer, req.file.size);

        console.log('ID de la pregunta:', pcp_id);
        console.log('Archivo creado por:', creador);

        transaction = new sql.Transaction(conn)
        await transaction.begin()

        const DocumentKeyQuestionResult = await new sql.Request(transaction)
            .input('idPreguntaClave', sql.UniqueIdentifier, pc_id)
            .input('idPregunta', sql.UniqueIdentifier, pcp_id)
            .input('texto',sql.NVarChar,texto)
            .input('idcreador', sql.UniqueIdentifier, creador)
            .query('INSERT INTO DocumentosPreguntasClave (pc_id,pcp_id,documento,creador) VALUES (@idPreguntaClave,@idPregunta,@texto,@idcreador)');

        await transaction.commit();

        res.send({ mensaje: 'Archivo subido correctamente' });

       
    } catch (error) {
        console.error('Database Error:', error);
        res.status(500).json({ 
            message: 'Error al actualizar el documento',
            details: error.message
        });
    }
}

export const getDocumentKeyQuestionsUser = async (req,res) => {
    try {
        const conn = await getConnection();
        const {id,user} = req.params;

        console.log('id de la pregunta clave unica',id)
        console.log('id del usuario',user)

        const result =await conn.request()
        .input('id',sql.UniqueIdentifier,id)
        .input('user',sql.UniqueIdentifier,user)
        .query(`SELECT 
                    p.id,
                    p.pc_id,
                    p.pcp_id,
                    p.documento,
                    p.hora_creacion,
                    p.creador,
                    (
                        select u.Nombre
                        FROM Usuarios u
                        WHERE id = p.creador
                    ) as NombreUsuario,
                    p.flag                 
                FROM DocumentosPreguntasClave p
                WHERE p.pcp_id = @id and p.creador = @user
                ORDER BY p.hora_creacion DESC
            `);
            console.log('Temas body',result)
            res.status(200).json(
                result
            );
    } catch (error) {
        console.error('Error en la base de datos:', error);
        res.status(500).json({ 
            message: 'Error obteniendo documentos de la Preguntas clave',
            details: error.message 
        });
    }
};

export const getUrlsKeyQuestions = async (req,res) => {
    try {
        const conn = await getConnection();
        const {id} = req.params;

        console.log('id de la pregunta clave unica',id)

        const result =await conn.request()
        .input('id',sql.UniqueIdentifier,id)
        .query(`SELECT 
                    p.id,
                    p.pc_id,
                    p.pcp_id,
                    p.texto,
                    p.hora_creacion,
                    p.creador,
                    (
                        select u.Nombre
                        FROM Usuarios u
                        WHERE id = p.creador
                    ) as NombreUsuario,
                    p.flag                 
                FROM EnlacesPreguntasClave p
                WHERE p.pcp_id = @id
                ORDER BY p.hora_creacion DESC
            `);
            console.log('Temas body',result)
            res.status(200).json(
                result
            );
    } catch (error) {
        console.error('Error en la base de datos:', error);
        res.status(500).json({ 
            message: 'Error obteniendo enlaces de Preguntas clave',
            details: error.message 
        });
    }
};

export const getUrlsKeyQuestionsUser = async (req,res) => {
    try {
        const conn = await getConnection();
        const {id,user} = req.params;

        console.log('id de la pregunta clave unica',id)

        const result =await conn.request()
        .input('id',sql.UniqueIdentifier,id)
        .input('user',sql.UniqueIdentifier,user)
        .query(`SELECT 
                    p.id,
                    p.pc_id,
                    p.pcp_id,
                    p.texto,
                    p.hora_creacion,
                    p.creador,
                    (
                        select u.Nombre
                        FROM Usuarios u
                        WHERE id = p.creador
                    ) as NombreUsuario,
                    p.flag                 
                FROM EnlacesPreguntasClave p
                WHERE p.pcp_id = @id and p.creador = @user
                ORDER BY p.hora_creacion DESC
            `);
            console.log('Temas body',result)
            res.status(200).json(
                result
            );
    } catch (error) {
        console.error('Error en la base de datos:', error);
        res.status(500).json({ 
            message: 'Error obteniendo enlaces de Preguntas clave',
            details: error.message 
        });
    }
};

export const createNewUrl = async (req, res) => {
    let transaction;
    const conn = await getConnection();

    try {

        console.log('estamos en esta función de crear el comentario de la pregunta de la pregunta clave')
        console.log('respuesta obtenida desde el front',req.body)

        const idpreguntaClave = req.body.pc_id
        const idpregunta = req.body.pcp_id
        const texto = req.body.texto
        const creador = req.body.creador

        console.log('preguntaclave',idpreguntaClave)
        console.log('usuarios',idpregunta)
        console.log('enlace',texto)
        console.log('correo',creador)

        if(!idpreguntaClave || !idpregunta || !texto || !creador){
            return res.status(400).json({message:'Requiere todos los campos'});
        }

        transaction = new sql.Transaction(conn)
        await transaction.begin()

        const CommentKeyQuestionResult = await new sql.Request(transaction)
            .input('idPreguntaClave', sql.UniqueIdentifier, idpreguntaClave)
            .input('idPregunta', sql.UniqueIdentifier, idpregunta)
            .input('texto',sql.NVarChar,texto)
            .input('idcreador', sql.UniqueIdentifier, creador)
            .query('INSERT INTO EnlacesPreguntasClave (pc_id,pcp_id,texto,creador) VALUES (@idPreguntaClave,@idPregunta,@texto,@idcreador)');

        await transaction.commit();
    } catch (error) {
        if (transaction && transaction._begun) {
            await transaction.rollback();
        }
        console.error('Database Error:', error);
        res.status(500).json({ 
            message: 'Error al actualizar el enlace',
            details: error.message
        });
    }
}

export const createNewAnswerKeyQuestion = async (req, res) => {
    let transaction;
    const conn = await getConnection();

    try {

        console.log('estamos en esta función de crear la respuesta de la pregunta clave')
        console.log('respuesta obtenida desde el front',req.body)

        const idpreguntaClave = req.body.pc_id
        const preguntas = req.body.estadosPreguntas
        const creador = req.body.creador

        console.log('preguntaclave',idpreguntaClave)
        console.log('preguntas',preguntas)
        console.log('idUsuario',creador)

        if(!idpreguntaClave || !preguntas || !creador){
            return res.status(400).json({message:'Requiere todos los campos'});
        }

        transaction = new sql.Transaction(conn)
        await transaction.begin()

        for (const pregunta of preguntas) {
            const { id, activo } = pregunta;

            await new sql.Request(transaction)
                .input('pc_id', sql.UniqueIdentifier, idpreguntaClave)
                .input('pcp_id', sql.UniqueIdentifier, id)
                .input('respuesta', sql.Bit, activo)
                .input('creador', sql.UniqueIdentifier, creador)
                .query(`
                    INSERT INTO RespuestasPreguntasClave (pc_id, pcp_id, respuesta, creador)
                    VALUES (@pc_id, @pcp_id, @respuesta, @creador)
                `);
        }

        await transaction.commit();
        res.status(200).json({ message: 'Respuestas guardadas correctamente' });

    } catch (error) {
        if (transaction && transaction._begun) {
            await transaction.rollback();
        }
        console.error('Database Error:', error);
        res.status(500).json({ 
            message: 'Error al actualizar el comentario',
            details: error.message
        });
    }
}

export const getAnswerKeyQuestionsUser = async (req,res) => {
    try {
        const conn = await getConnection();
        const {id} = req.params;

        console.log('id de la pregunta clave unica',id)

        const result =await conn.request()
        .input('id',sql.UniqueIdentifier,id)
        .query(`SELECT 
                    p.id,
                    p.pc_id,
                    p.pcp_id,
                    p.respuesta,
                    p.hora_creacion,
                    p.creador,
                    (
                        select u.Nombre
                        FROM Usuarios u
                        WHERE id = p.creador
                    ) as NombreUsuario,
                    p.flag                 
                FROM RespuestasPreguntasClave p
                WHERE p.pcp_id = @id
                ORDER BY p.hora_creacion DESC
            `);
            console.log('Temas body',result)
            res.status(200).json(
                result
            );
    } catch (error) {
        console.error('Error en la base de datos:', error);
        res.status(500).json({ 
            message: 'Error obteniendo respuestas de la Preguntas clave',
            details: error.message 
        });
    }
};

export const getReportKeyQuestions = async (req, res) => {
    try {
        const conn = await getConnection();
        const {id} = req.params;

        console.log('id de la pregunta clave unica',id)
        const keyResult =  await conn.request()
            .input('id', sql.UniqueIdentifier, id)
            .query('SELECT id, nombre,usuarioElegido,estado FROM PreguntasClave WHERE id = @id');

        console.log('temas:',keyResult)
        
        if (!keyResult.recordset[0]){
            return res.status(404).json({message: 'Pregunta clave no encontrada'});
        }

        const questionsResult = await conn.request()
            .input('pc_id', sql.UniqueIdentifier,id)
            .query(`
                    SELECT 
                        id, 
                        texto
                    FROM PreguntasPreguntaClave 
                    WHERE pc_id = @pc_id
                    ORDER BY hora_creacion DESC
                `);
        
        console.log('preguntas de la pregunta clave',questionsResult)
        
        const preguntasConConteo = [];
        
        for (const pregunta of questionsResult.recordset) {
            console.log('pregunta',pregunta)

            console.log('id',pregunta.id)
            console.log('pregunta', pregunta.texto)

            const countResult = await conn.request()
                .input('pc_id', sql.UniqueIdentifier,id)
                .input('pcp_id',sql.UniqueIdentifier,pregunta.id)
                .query(`
                        SELECT
                            pc_id,
                            pcp_id,
                            COUNT(CASE WHEN respuesta = 0 THEN 1 END) AS conteo_no,
                            COUNT(CASE WHEN respuesta = 1 THEN 1 END) AS conteo_si,
                            COUNT(respuesta) AS conteo_total
                        FROM
                            RespuestasPreguntasClave
                        WHERE pc_id = @pc_id and pcp_id = @pcp_id
                        GROUP BY
                            pc_id,
                            pcp_id;
                    `);
            
            console.log('Resultado del conteo',countResult)

            const conteo = countResult.recordset[0] || { conteo_no: 0, conteo_si: 0,conteo_total : 0 };

            preguntasConConteo.push({
                id: pregunta.id,
                texto: pregunta.texto,
                conteo_si: conteo.conteo_si,
                conteo_no: conteo.conteo_no,
                conteo_total : conteo.conteo_total
            });
        }
        
        res.json({
            id: keyResult.recordset[0].id,
            nombre: keyResult.recordset[0].nombre,
            elegido:keyResult.recordset[0].usuarioElegido,
            estado : keyResult.recordset[0].estado,
            preguntas:preguntasConConteo
        });

    }catch (error) {
        console.error('Error en la base de datos:', error);
        res.status(500).json({
            message: 'Error obteniendo las preguntas clave y su reporte',
            details: error.message
        });
    }
}

export const getFullKeyQuestionDataDetail = async (req,res) => {
    try {
        const conn = await getConnection();
        const {pc_id,pcp_id} = req.params;

        console.log('id de la pregunta clave',pc_id)
        console.log('id de la pregunta de la pregunta clave',pcp_id)
        const keyResult =  await conn.request()
            .input('pc_id', sql.UniqueIdentifier, pc_id)
            .query('SELECT id, nombre FROM PreguntasClave WHERE id = @pc_id');

        console.log('temas:',keyResult)
        
        if (!keyResult.recordset[0]){
            return res.status(404).json({message: 'Pregunta clave no encontrada'});
        }

        const keyQuestionResult =  await conn.request()
            .input('pcp_id', sql.UniqueIdentifier, pcp_id)
            .query('SELECT id, texto FROM PreguntasPreguntaClave WHERE id = @pcp_id');

        console.log('pregunta de la pregunta clave:',keyQuestionResult)

        const usersResult = await conn.request()
            .input('pc_id', sql.UniqueIdentifier,pc_id)
            .query(`
                    SELECT 
                        p.usuario_id, 
                        p.id,
                        (SELECT u.Nombre
                            FROM Usuarios u
                            WHERE id = p.usuario_id
                        ) as NombreUsuario
                    FROM UsuariosPreguntaClave p
                    WHERE p.pc_id = @pc_id 
                    ORDER BY hora_creacion DESC
                `);
        
        console.log('usuarios de la pregunta clave',usersResult)

        const commentResult = await conn.request()
            .input('pc_id', sql.UniqueIdentifier,pc_id)
            .input('pcp_id',sql.UniqueIdentifier,pcp_id)
            .query(`
                    SELECT 
                        p.id,
                        p.texto,
                        p.creador,
                        p.hora_creacion,
                        (SELECT u.Nombre
                            FROM Usuarios u
                            WHERE id = p.creador
                        ) as NombreUsuario
                    FROM ComentariosPreguntasClave p
                    WHERE p.pc_id = @pc_id and p.pcp_id = @pcp_id
                    ORDER BY hora_creacion DESC
                `);
        
        console.log('usuarios de la pregunta clave',commentResult)
        
        res.json({
            id: keyResult.recordset[0].id,
            nombre: keyResult.recordset[0].nombre,
            pcp_id:keyQuestionResult.recordset[0].id,
            nombre_pc:keyQuestionResult.recordset[0].texto,
            usuarios:usersResult.recordset,
            comentarios:commentResult.recordset
        });

    }catch (error) {
        console.error('Error en la base de datos:', error);
        res.status(500).json({
            message: 'Error obteniendo los temas',
            details: error.message
        });
    }
  };

export const changeFinalChoose = async (req,res) => {

    let transaction;
    const conn = await getConnection();

    try {
        const {id} = req.params;
        const {decision,comentario,pc_id} = req.body;

        const decide = req.body.decisionFinal;

        console.log('id de la pregunta clave',id)
        console.log('la decision fue',decide)
        console.log('el comentario',comentario)
        console.log('id pregunta c',pc_id)

        transaction = new sql.Transaction(conn);
        await transaction.begin();

        await new sql.Request(transaction)
        .input('id',sql.UniqueIdentifier,id)
        .input('decision',sql.Bit,decide)
        .input('comentario',sql.NVarChar,comentario)
        .query(`
               UPDATE PreguntasClave
                SET comentario = @comentario, decisionFinal = @decision, estado = 'Finalizado'
                WHERE id = @id
            `);
        
        await transaction.commit();

        res.status(200).json({ message: 'Pregunta clave actualizada correctamente' });
    } catch (error) {
        console.error('Error en la base de datos:', error);
        res.status(500).json({ 
            message: 'Error actualizando la Preguntas clave',
            details: error.message 
        });
    }
};

export const FinalCommentKeyQuestion = async (req,res) => {

    let transaction;
    const conn = await getConnection();

    try {
        const {id} = req.params;
        const {comentario,pc_id} = req.body;

        console.log('id de la pregunta clave',id)
        console.log('el comentario',comentario)
        console.log('id pregunta c',pc_id)

        transaction = new sql.Transaction(conn);
        await transaction.begin();

        await new sql.Request(transaction)
        .input('id',sql.UniqueIdentifier,id)
        .input('comentario',sql.NVarChar,comentario)
        .query(`
               UPDATE PreguntasClave
                SET comentarioFinal = @comentario
                WHERE id = @id
            `);
        
        await transaction.commit();

        res.status(200).json({ message: 'Pregunta clave y comentario final actualizada correctamente' });
    } catch (error) {
        console.error('Error en la base de datos:', error);
        res.status(500).json({ 
            message: 'Error actualizando el comentario final de la Preguntas clave',
            details: error.message 
        });
    }
};


export const obtenerConfiguracion = async (req, res) => {
   
    const conn = await getConnection();
    try {
        
        const result = await conn.request()
        .query('SELECT id,nombre, valor FROM ConfiguracionGlobal');

        const config = {};
        result.recordset.forEach(row => {
        config[row.nombre] = row.valor;
    });

        res.json(config);
    } catch (error) {
        console.error('Error al obtener configuración:', error);
        res.status(500).send('Error al obtener configuración');
    }
};

export const guardarConfiguracion = async (req, res) => {
    let transaction;
    const conn = await getConnection();

  try {  
    const {inMin,inMax,docMin,docMax} = req.body 
    
    transaction = new sql.Transaction(conn);
    await transaction.begin();

    await new sql.Request(transaction)
        .input('inMin', sql.NVarChar, inMin)
        .query(`
        UPDATE ConfiguracionGlobal 
        SET valor = @inMin WHERE nombre = 'inputComentarioMin'
        `);

    await new sql.Request(transaction)
        .input('inMax', sql.NVarChar, inMax)
        .query(`
        UPDATE ConfiguracionGlobal 
        SET valor = @inMax WHERE nombre = 'inputComentarioMax'
    `);

    await new sql.Request(transaction)
        .input('docMin', sql.NVarChar, docMin)
        .query(`
        UPDATE ConfiguracionGlobal 
        SET valor = @docMin WHERE nombre = 'DocumentoMin'
        `);

    await new sql.Request(transaction)
        .input('docMax', sql.NVarChar, docMax)
        .query(`
        UPDATE ConfiguracionGlobal 
        SET valor = @docMax WHERE nombre = 'DocumentoMax'
    `);

    await transaction.commit();
    

    res.json({ message: 'Configuración actualizada exitosamente' });
  } catch (error) {
    console.error('Error al guardar configuración:', error);
    res.status(500).send('Error al guardar configuración');
  }
};


