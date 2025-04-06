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
        const userData = {
            displayName : req.user.displayName,
            email:req.user._json.mail || req.user._json.userPrincipalName,
            photo: req.user.photos && req.user.photos[0] && req.user.photos[0].value || 
            `https://ui-avatars.com/api/?name=${encodeURIComponent(req.user.displayName)}&background=0078d4&color=fff`,
            id: req.user.id
        };

        const frontendOrigin = "http://localhost:5000";

        res.send(
            ` <!DOCTYPE html>
            <html>
            <head>
                <title>Authentication Complete</title>
                <script>
                    try {
                        window.opener.postMessage(
                            ${JSON.stringify({ user: userData })},
                            "${frontendOrigin}"
                        );
                    } catch (error) {
                        console.error("PostMessage error:", error);
                    }
                    window.close();
                </script>
            </head>
            <body>
                <p>Authentication complete. You may close this window.</p>
            </body>
            </html>
            `);
    } else {
        res.redirect("/auth/microsoft");
    }
});

export{loginRouter}