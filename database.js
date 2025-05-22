import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();


const dbSettings = {
    user: process.env.USER_DB,
    password: process.env.PASSWORD_DB,
    server: process.env.SERVER_DB,
    database: process.env.DATABASE_NAME,
    options: {
        encrypt: true, 
        trustServerCertificate: true 
      },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
      }
};

console.log(dbSettings)

let conexion;

export async function getConnection() {
    try {
        if(conexion) return conexion;

        conexion =  new sql.ConnectionPool(dbSettings)
        .connect();
        console.log('Conectado a la base de datos')
        return conexion;
    }catch (error) {
        console.error('Error en la conexión con la base de datos.', error);
        throw error;
    }
}

export {sql};