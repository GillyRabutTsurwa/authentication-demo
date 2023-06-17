const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const bodyParser = require("body-parser");
const session = require("express-session");
const LocalStrategy = require("passport-local").Strategy;
const passportLocalMongoose = require("passport-local-mongoose");

const User = require("./models/users");

mongoose.connect("mongodb://127.0.0.1:27017/authentication_demo_app", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
    session({
        secret: "Bonjour mes frères et sœurs",
        resave: false,
        saveUninitialized: false,
    })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ==================== ROUTES ====================

app.get("/", (req, res) => {
    console.log(req.user);
    res.render("home", {
        message: "Hello from deez nuts",
        user: req.user, // object with our user data. QUESTION: ça vient de Passport ?
    });
});

app.get("/secret", isLoggedIn, (req, res) => {
    res.render("secret", {
        user: req.user.username,
    });
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {
    const { username, password } = req.body;
    User.register(new User({ username: username }), password, (err, user) => {
        if (err) {
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, () => {
            res.redirect("/secret");
        });
    });
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post(
    "/login",
    passport.authenticate("local", {
        successRedirect: "/secret",
        failureRedirect: "/login",
    })
);

app.get("/logout", (req, res) => {
    req.logout(function (err) {
        if (err) {
            console.log(err);
            return res.redirect("/");
        }
        res.redirect("/");
    });
});

// TESTING
// app.use(function (request, response, next) {
//     response.locals.currentUser = request.user;
//     next();
// });

// NEW: IMPORTANT: Our middleware function
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        console.log(req.user);
        return next();
    }
    res.redirect("/login");
}

app.listen(5000, () => {
    console.log("The server has started");
});
