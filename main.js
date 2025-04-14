import express from "express";
import { loginRouter } from "./routes/microsoftRoutes.js";
import passport from "passport";
import "./middlewares/microsoft.js";
import bodyParser from "body-parser"
import themeRouter from './routes/themeRoutes.js'
import cors from 'cors';  
import { getConnection } from "./config/database.js";
import session from 'express-session'

const app = express()

async function initialize(){
    try {
        await getConnection();
        console.log('Conectado a la base de datos de SQL Server')
    } catch (error) {
        console.error('Error al conectar con la base de datos: ', error)
    }
}

async function testConnection() {
    try {
      const pool = await getConnection();
      const result = await pool.request().query('SELECT 1 as test');
      console.log('Database test query successful:', result.recordset);
    } catch (error) {
      console.error('Database test failed:', error);
    }
  }

app.use(cors({
    origin: 'http://localhost:5000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(bodyParser.json())
app.use(passport.initialize())
app.use("/auth",loginRouter)
app.use('/api/themes', themeRouter)

app.use((err,req,res,next) => {
    console.error(err.stack);
    res.status(500).send('Algo fue mal');
});

app.use(session({
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized: false,
    cookie :{
        secure:process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.use(passport.session());

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));

testConnection();
initialize();
