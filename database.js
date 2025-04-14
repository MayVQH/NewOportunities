import sql from 'mssql';


const dbSettings = {
    user: process.env.USER_DBB,
    password: process.env.PASSWORD_DB,
    server: process.env.SERVER_DB,
    database: process.env.DATABASE_NAME,
    options: {
        encrypt: true, // For Azure
        trustServerCertificate: true // For self-signed certs
      }
};

let conexion;

export async function getConnection() {
    try {
        if(conexion) return conexion;

        conexion = sql.connect(dbSettings);
        console.log('Conectado a la base de datos')
        return conexion;
    }catch (error) {
        console.error('Error en la conexión con la base de datos.', error);
        throw error;
    }
}

export {sql};