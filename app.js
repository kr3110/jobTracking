var express = require('express');
var gmail = require('node-gmail-api');
var passport = require('passport');
var mongoose = require('mongoose');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser= require('body-parser');
var session=require('express-session');
var path= require('path');
var app = express();
var fs = require('fs')
var jsondata;
fs.readFile('testing.json', function (err, data) {
    jsondata= JSON.parse(data)
});
//db Connection MongoDB
/***************************
 *        config           *
 ***************************/
var user="username"
var password="password";
var externalUrl="url"
 var dburl=`mongodb://${user}:${password}@${externalUrl}/jobtracking`;
 mongoose.connect(dburl, {
   useMongoClient: true
 });
 var db = mongoose.connection;
 db.on('error', console.error.bind(console, 'MongoDB connection error:'));


app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));
//static files
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({
    secret: 'trackingyourjob2017', // session secret
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

app.get('/google50bd14559a8ebfe0.html', function(req,res){
  res.sendfile(__dirname + '/views/google50bd14559a8ebfe0.html');
});
/***************************
 *       Routing           *
 ***************************/
// route for home page
// routes for testing ( they will change once front is done)
app.get('/', function(req, res) {
  res.render('landingpage.ejs'); // render home
});

app.get('/bloomberg',function(req, res) {
    res.render('companydetails.ejs');
});

app.get('/times',function(req, res) {
    res.render('companydetails.ejs');
});
require('./passport')(passport);
// route for showing the profile page
app.get('/dashboard', isLoggedIn, function(req, res) {
  res.render('dashboard.ejs', {
    data:jsondata
  });
});

// route for logging out
app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

app.get('/auth/google', passport.authenticate('google', {
  scope: ['https://mail.google.com',
    'profile',
    'email']
}));

// the callback after google has authenticated the user
//star is to allow any income token to pass thru//

app.get('/auth/google/callback*',
  passport.authenticate('google', {
    successRedirect: '/dashboard',
    failureRedirect: '/'
  }));



  /***************************
   *       middleware           *
   ***************************/
// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
    return next();

  // if they aren't redirect them to the home page
  res.redirect('/');
}

/***************************
 *       Port listener     *
 ***************************/
var port = process.env.PORT || 8080;
app.listen(port);
