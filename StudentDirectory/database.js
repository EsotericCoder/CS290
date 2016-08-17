var express = require('express');
var mysql = require('./dbcon.js');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var bodyParser = require('body-parser');
var request = require('request');

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 3000);
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/',function(req,res,next){
  var context = {};
  context.time = new Date();
  res.render('time', context);
});

app.get('/assign2', function(req,res,next){
  res.render('input');
});

app.get('/assign2/edit', function(req,res,next){
  var context;
  mysql.pool.query("SELECT * from student WHERE id=?", [req.query.id],
  function(err, row, fields){
    if(err){
      console.log(err);
    }
    var string = JSON.stringify(row);
    var parse = JSON.parse(string);

    if( parse[0].gender == "male"){
      parse[0].checkedMale = "checked";
    }else if( parse[0].gender == "female"){
      parse[0].checkedFemale = "checked";
    }else if ( parse[0].gender == "other"){
      parse[0].checkedOther = "checked";
    }

    if( parse[0].updates == "yes"){
      parse[0].checkedYes = "checked";
    }else if( parse[0].updates == "no" ){
      parse[0].checkedNo = "checked";
    }

    var text = '{"dataList" :' + JSON.stringify(parse) + '}';
    context = JSON.parse(text);
    res.render('edit', context);
  });
});

app.get('/assign2/add', function(req,res,next){
  if(req.query.lname != "" && req.query.fname != "" && req.query.email != ""){
    mysql.pool.query("INSERT INTO student (`fname`,`lname`, `email`, `tel`, `gender`, `updates`) VALUES (?,?,?,?,?,?)", 
      [req.query.fname, req.query.lname, req.query.email, req.query.tel, req.query.gender, req.query.updates], function(err, result){
        if(err){
          console.log(err);
        }
    });
  }
  res.render('input');
});

app.get('/assign2/list',function(req,res,next){
  var context;
  mysql.pool.query('SELECT * FROM student', function(err, rows, fields){
    if(err){
      console.log(err);
    }
    var text = '{"dataList" :' + JSON.stringify(rows) + '}';
    context = JSON.parse(text);
    res.render('list', context);
  });
});

app.get('/assign2/update',function(req,res,next){
  if(req.query.fname != "" && req.query.lname != "" && req.query.email != ""){
    mysql.pool.query('UPDATE student SET fname=?, lname=?, email=?, tel=?, gender=?, updates=? WHERE id=?',
      [req.query.fname, req.query.lname, req.query.email, req.query.tel, req.query.gender, req.query.updates, req.query.id], function(err){
      if(err){
        console.log(err);
      }
    });
  }
  res.redirect('/assign2/list');
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