import passport from "passport"
import { Strategy as MicrosoftStrategy } from "passport-microsoft";
import {config} from "dotenv"
import axios from "axios";


config()

passport.use("auth-microsoft", new MicrosoftStrategy({
    clientID: process.env.MICROSOFT_CLIENT_ID,
    clientSecret:process.env.MICROSOFT_CLIENT_SECRET,
    callbackURL: process.env.MICROSOFT_REDIRECT_URI,
    scope: ["user.read","calendars.read","mail.read","offline_access","openid"],
    prompt: 'select_account',
    tenant: 'common',
    cookieEncryptionKey: [
        {key:process.env.COOKIE_KEY, iv:process.env.COOKIE_IV}
    ],
    passReqToCallback:true,
    authorizationURL:"https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    tokenURL:'https://login.microsoftonline.com/common/oauth2/v2.0/token'
}, async function (req,accessToken,refreshToken,profile,done) {
    try {
        const photoResponse = await axios.get('https://graph.microsoft.com/v1.0/me/photo/$value',
            {
                headers:{
                    'Authorization': `Bearer ${accessToken}`
                },
                responseType: 'arraybuffer'
            }
        );

        const photoBase64 = Buffer.from(photoResponse.data, 'binary').toString('base64');
        const photoUrl = `data:${photoResponse.headers['content-type']};base64,${photoBase64}`;

        profile.photos = [{value:photoUrl}];
        req.session.microsoftTokens ={
            accessToken,
            refreshToken
        };
        console.log(profile)
        done(null,profile)


    } catch (error){
        console.error('Error al obtener la imagen de perfil: ',error.message);
        profile.photo = [];
        done(null,profile);
    }
    profile._json.photo = profile.photos && profile.photos[0] && profile.photos[0].value;
    console.log(profile);

    done(null,profile)
}));