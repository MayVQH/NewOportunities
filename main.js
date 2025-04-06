import express from "express";
import { loginRouter } from "./routes/microsoftRoutes.js";
import passport from "passport";
import "./middlewares/microsoft.js"
import path from "path";



const app = express()

app.use(passport.initialize())
app.use("/auth",loginRouter)
app.listen(3000, () => console.log("http://localhost:3000"));
