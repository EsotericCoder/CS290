var express = require('express');
var mysql = require('./dbcon.js');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var session = require('client-sessions');
var bodyParser = require('body-parser');
var request = require('request');
var userId = "";


app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 3000);
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  cookieName: 'mySession', 
  secret: 'blargadeeblargblarg',
  duration: 24 * 60 * 60 * 1000, 
  activeDuration: 1000 * 60 * 5 
}));

//GETS

app.get('/',function(req,res,next){
  res.render('login');
});

app.get('/filter', function (req, res, next) {
    var context;
    mysql.pool.query("SELECT * FROM hh_Request r INNER JOIN hh_User u ON u.UserId = r.RequesterId WHERE ((u.City=? AND u.State=?) OR (u.Zip=?)) AND VolunteerId IS NULL",
       [req.query.citySearch, req.query.stateSearch, req.query.zipSearch], function (err, rows, fields) {
            if (err) {
                console.log(err);
            }
            console.log(rows[0]);
            var text = '{"dataList" :' + JSON.stringify(rows) + '}';
            context = JSON.parse(text);
            res.render('jobs', context);
        });
});

app.get('/requests',function(req,res,next){
  var context;
  var time = new Date();
  if(req.query.Description != ""){
    //Need to replace 1 with actual requesterID when sessions is figured out
    mysql.pool.query("SELECT * FROM hh_User WHERE UserId=?", userId, function(err, row, fields) {
          userId = row[0].UserId;
    
      mysql.pool.query("INSERT INTO hh_Request (`Description`, `RequestType`, `DateRequested`, `RequesterId`) VALUES (?,?,?,?)", 
        [req.query.Description, req.query.RequestType, time, userId], function(err, result){
          if(err){
            console.log(err);
          }
          res.render('requests');
      });
    });
  }
});

app.get('/list',function(req,res,next){
  var context;
  mysql.pool.query('SELECT * FROM hh_Request r INNER JOIN hh_User u ON u.UserId = r.RequesterId WHERE VolunteerId IS NULL', function(err, rows, fields){
    if(err){
      console.log(err);
    }
    var text = '{"dataList" :' + JSON.stringify(rows) + '}';
    context = JSON.parse(text);
    res.render('jobs', context);
  });
});

//POSTS

app.post('/login', function(req, res) {
  mysql.pool.query("SELECT * FROM hh_User WHERE Email=?", req.body.Email, function(err, row, fields) {
    //If the query result is empty then no email exists.
    if (row == null) {
      console.log("User email not found");
      //Send back to login
      res.render('login');    //Render the login Handlebars page
    //Else a matching email was found and now we can test against password
    } else {
      //If the password is correct matches whats in the database 
      if (req.body.Password == row[0].Password) {
        userId = row[0].UserId;
        res.redirect('/requests');
      } else {
        console.log("Wrong Password");
        res.render('login');
      }
    }
  });
});

app.post('/registration',function(req,res,next){
  var context;
  if(req.body.Email != ""){
    mysql.pool.query("INSERT INTO hh_User (`FirstName`, `LastName`, `Email`, `Password`, `Phone`, `AddressLine1`, `AddressLine2`, `City`, `State`, `Zip`) VALUES (?,?,?,?,?,?,?,?,?,?)", 
      [req.body.FirstName, req.body.LastName, req.body.Email, req.body.Password, req.body.Phone, req.body.Address1, req.body.Address2, req.body.City, req.body.State, req.body.Zip], 
      function(err, result){
        if(err){
          console.log(err);
        }
        mysql.pool.query("SELECT * FROM hh_User WHERE Email=?", req.body.Email, function(err, row, fields) {
          userId = row[0].UserId;
        });
        res.render('requests');
    });
  }
});

app.post('/pickJob',function(req,res,next){
  var context;
  //Once we get the sessions working, we can run this code.
  mysql.pool.query("UPDATE hh_Request SET VolunteerId=?  WHERE RequestId=?",
  [userId, req.body.id], function(err, rows, fields){
    if(err){
      console.log(err);
    }
    mysql.pool.query('SELECT * FROM hh_Request r INNER JOIN hh_User u ON u.UserId = r.RequesterId WHERE VolunteerId IS NULL', function(err, rows, fields){
    if(err){
      console.log(err);
    }
    var text = '{"dataList" :' + JSON.stringify(rows) + '}';
    context = JSON.parse(text);
    res.render('jobs', context);
  });
  });
});


app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});