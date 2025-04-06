import passport from "passport"
import { Strategy as MicrosoftStrategy } from "passport-microsoft";
import {config} from "dotenv"

config()

passport.use("auth-microsoft", new MicrosoftStrategy({
    clientID: process.env.MICROSOFT_CLIENT_ID,
    clientSecret:process.env.MICROSOFT_CLIENT_SECRET,
    callbackURL: process.env.MICROSOFT_REDIRECT_URI,
    scope: ["user.read","calendars.read","mail.read","offline_access"],
    authorizationURL:"https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    tokenURL:'https://login.microsoftonline.com/common/oauth2/v2.0/token'
}, function (accessToken,refreshToken,profile,done) {
    profile._json.photo = profile.photos && profile.photos[0] && profile.photos[0].value;
    console.log(profile);

    done(null,profile)
}
));