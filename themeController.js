import { getConnection,sql } from "../config/database.js";

export const getAllThemes = async (req,res) => {
    try {
        const conn = await getConnection();
        const result =await conn.request()
        .query('SELECT * FROM Temas WHERE flag = 1 ORDER BY hora_creacion DESC');
        res.json(result.recordset);
    } catch (error) {
        console.error('Database Error:', error);
        res.status(500).json({ 
            message: 'Error fetching themes',
            details: error.message 
        });
    }
};

  export const createTheme = async (req, res) => {
    try {
        const {nombre,preguntas} = req.body;

        if(!nombre || !preguntas){
            return res.status(400).json({message:'Requiere todos los campos de nombre y preguntas'});
        }
        const conn = await getConnection();
        const result = await conn.request()
        .input('nombre', sql.VarChar,nombre)
        .input('preguntas',sql.VarChar, JSON.stringify(preguntas.filter(q => q.trim() !== '')))
        .query('INSERT INTO Temas (nombre,preguntas) OUTPUT inserted.* VALUES (@nombre,@preguntas)');
        res.status(201).json(result.recordset[0]);
    } catch (error) {
        console.error('Database Error:', error);
        res.status(500).json({ 
      message: 'Error al crear el tema',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    }
  };
  
  export const deleteTheme = async (req, res) => {
    try {
        const conn = await getConnection();
        await conn.request().input('id',sql.Int, req.params.id)
        .input('UPDATE FROM Temas WHERE id= @id');
        res.status(204).send();
    } catch (error) {
        console.error('Database Error:', error);
        res.status(500).json({ 
            message: 'Error al eliminar el tema',
            details: error.message 
        });
    }
};