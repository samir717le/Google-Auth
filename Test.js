const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const app = express();
// Config 

const GOOGLE_CLIENT_ID = ${{ GOOGLE_CLIENT_ID }} ;
const GOOGLE_CLIENT_SECRET = ${{ GOOGLE_CLIENT_SECRET }};

const CALLBACK_URI = '/auth/google/callback';

// EJS setup
app.set('view engine', 'ejs');

// Express session setup
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_default_secret',
    resave: false,
    saveUninitialized: true
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Passport serialization
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret:  GOOGLE_CLIENT_SECRET,
    callbackURL: CALLBACK_URI || '/auth/google/callback'
  },
  (token, tokenSecret, profile, done) => {
    return done(null, profile);
  }
));

// Routes
app.get('/', (req, res) => {
    res.render('index', { user: req.user });
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/');
  }
);

app.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});

// Protect a route
app.get('/profile', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }
    res.render('profile', { user: req.user });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
