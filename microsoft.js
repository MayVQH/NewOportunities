import {Router} from "express";
import passport from "passport"

const loginRouter = Router()

loginRouter.get("/microsoft",
    passport.authenticate("auth-microsoft", {
    prompt: "select_account",
    session :false
}));

loginRouter.get("/microsoft/callback",passport.authenticate("auth-microsoft", {
    failureRedirect: "/auth/microsoft",
    session: false,
}), (req,res) => {
    if (req.user){
        res.redirect(`http://localhost:3000/dashboard?user=${encodeURIComponent(JSON.stringify(req.user))}`);
    } else {
        res.redirect("/auth/microsoft");
    }
});

export{loginRouter}