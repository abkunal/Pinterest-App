var express = require("express");
var router = express.Router();
var User = require("../models/user");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var bcrypt = require("bcryptjs");

router.post("/signup", (req, res) => {
  if (req.user) {
    res.redirect("/");
  }
  else {
    let name = req.body.name.trim();
    let email = req.body.email.trim();
    let password = req.body.password;
    console.log(name, email, password);

    req.checkBody("name", "Name is required").notEmpty();
    req.checkBody("email", "Email is required").notEmpty();
    req.checkBody("email", "Enter a valid email").isEmail();
    req.checkBody("password", "Password is required").notEmpty();

    // check whether there is any error
    var errors = req.validationErrors();
    
    // if errors, show errors
    if (errors) {
      res.render("signup", {
        errors: errors
      });
    }
    else {
      let username = email.substring(0, email.indexOf("@"));

      let newUser = new User({
        name: name,
        username: username,
        email: email,
        password: password
      });

      User.getUserByEmail(email, (err, user) => {
        if (err) throw err;

        if (user) {
          console.log("User already exists");
          res.render("index", {
            error_msg: "email id already exists"
          });
        }
        else {
          User.createUser(newUser, (err, msg) => {
            if (err) throw err;
            console.log(msg);
          });
          res.render("index", {
            success_msg: "You have been registered successfully"
          });
        }
      });
    }
  }
});


// using passport module for handling local authentication
passport.use(new LocalStrategy({
    usernameField: 'email',       // username field name is email in form
    passwordField: 'password'     // password field name is password in form
  },
  function(email, password, done) {
    User.getUserByEmail(email, function(err, user) {
      if (err) throw err;
      
      // user with given id doesn't exist, show error
      if (!user) {
        return done(null, false, {message: "Unknown User"});
      }
      
      User.comparePassword(password, user.password, function(err, isMatch) {
        if (err) throw err;
        // correct password, authorize
        if (isMatch) {
          return done(null, user);
        }
        // incorrect password, show error
        else {
          return done(null, false, {message: "Invalid Password"});
        }
      });
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.email);
});

passport.deserializeUser(function(email, done) {
  User.getUserByEmail(email, function(err, user) {
    done(err, user);
  });
});

// login form submitted, handle authetication
router.post("/login", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/",
  failureFlash: true
  }),
  function(req, res) {
    console.log(req.user);
    res.redirect("/");
});

// logout the user
router.get("/logout", function(req, res) {
  // if user logged in, logout the user
  if (req.user) {
    req.logout();
    
    req.flash("success_msg", "You have been logged out successfully");
    res.redirect("/");  
  }
  else {
    res.redirect("/");
  }
});


module.exports = router;