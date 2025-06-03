import {Router} from "express";
import passport from "passport"
import dotenv from 'dotenv';

dotenv.config();

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
        const dbUser = req.user.databaseUser;

        const userData = {
            id: dbUser.id,
            displayName: dbUser.Nombre,
            email: dbUser.Email,
            tipoId: dbUser.tipoId,
            photo: req.user.photos?.[0]?.value || 
            `https://ui-avatars.com/api/?name=${encodeURIComponent(req.user.displayName)}&background=0078d4&color=fff`,
        };

        console.log(userData)

        const frontendOrigin = process.env.FRONTEND_ORIGIN;

        res.send(`<!DOCTYPE html>
            <html>
            <head>
                <script>
                    window.opener.postMessage(
                        ${JSON.stringify({ user: userData })},
                        "${process.env.FRONTEND_ORIGIN }"
                    );
                    window.close();
                </script>
            </head>
            <body></body>
            </html>`);

    } else {
        res.redirect("/auth/microsoft");
    }
});

loginRouter.get('/logout', (res,req) => {
    req.logout(() => {
        res.redirect('https://login.microsoftonline.com/common/oauth2/v2.0/logout?' + 
            new URLSearchParams({
              post_logout_redirect_uri: process.env.FRONTEND_ORIGIN,
              client_id: process.env.MICROSOFT_CLIENT_ID
            })
        );
    });
});
export{loginRouter}
