import express from 'express'
import bodyParser from 'body-parser'
import ejsLayouts from 'express-ejs-layouts'
import path from 'path'
import dotenv from 'dotenv'
import session from 'express-session'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

import { connectUsingMongoose } from './config/mongodb.js'
import router from "./routes/routes.js"
import authrouter from "./routes/authRoutes.js"


dotenv.config()
const app = express()


app.use(session({ secret: 'SecretKey', resave: false, saveUninitialized: true, cookie: { secure: false } }));


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.use(passport.initialize());
app.use(passport.session());

const callbackURL =
  process.env.NODE_ENV === "production"
    ? ""
    : "http://localhost:5500/auth/google/callback";
passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.CLIENT_ID,
			clientSecret: process.env.CLIENT_SECRET,
			callbackURL: "http://localhost:5500/auth/google/callback",
			scope: ["profile", "email"],
		},
		function (accessToken, refreshToken, profile, callback) {
			// console.log('Profile Data')
			// console.log(profile)
			callback(null, profile);
		}
	)
);

passport.serializeUser((user, done) => {
	done(null, user);
});

passport.deserializeUser((user, done) => {
	done(null, user);
});

// setting Templates
app.set("view engine", "ejs");   
app.use(ejsLayouts);            
app.set("views", path.join(path.resolve(), "views")); 

connectUsingMongoose()


app.get('/', (req, res) => {
    res.send('Hey Ninja ! Go to /user/signin to see the magic.')
})
app.use('/user', router)
app.use('/auth', authrouter)

//LISTEN
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`)
});


