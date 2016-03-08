/* William Kim
   kimw@oregonstate.edu
   CS290
   database.js
   3/8/16
*/

var express = require('express');
var mysql = require('./dbcon.js');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var request = require('request');

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 3000);



function updateRow(tableID,currentRow) {
    try {
        var table = document.getElementById(tableID);
        var rowCount = table.rows.length;
        for (var i = 0; i < rowCount; i++) {
            var row = table.rows[i];
            /*var chkbox = row.cells[0].childNodes[0];*/
            /*if (null != chkbox && true == chkbox.checked)*/
            
            if (row==currentRow.parentNode.parentNode) {
                if (rowCount <= 1) {
                    alert("Cannot delete all the rows.");
                    break;
                }
                table.deleteRow(i);
                rowCount--;
                i--;
            }
        }
    } catch (e) {
        alert(e);
    }  
}

app.get('/reset-table',function(req,res,next){
  var context;
  mysql.pool.query("DROP TABLE IF EXISTS workouts", function(err){
    var createString = "CREATE TABLE workouts(" +
    "id INT PRIMARY KEY AUTO_INCREMENT," +
    "name VARCHAR(255) NOT NULL," +
    "reps INT," +
    "weight INT," +
    "date DATE," +
    "lbs INT)";
    mysql.pool.query(createString, function(err){
      mysql.pool.query('SELECT * FROM workouts', function(err, rows, fields){
      if(err){
        next(err);
        return;
      }
      var text = '{"dataList" :' + JSON.stringify(rows) + '}';
      context = JSON.parse(text);
      res.render('table', context);
      });
    });
  });
});

app.get('/insert',function(req,res,next){
  var context;
  if(req.query.name != ""){
    mysql.pool.query("INSERT INTO workouts (`name`, `reps`, `weight`, `date`, `lbs`) VALUES (?,?,?,?,?)", [req.query.name, req.query.reps, req.query.weight, req.query.date, req.query.lbs], function(err, result){
    mysql.pool.query('SELECT * FROM workouts', function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    var text = '{"dataList" :' + JSON.stringify(rows) + '}';
    context = JSON.parse(text);
    res.render('table', context);
      });
    });
  }
});

app.get('/delete',function(req,res,next){
  var context;
    mysql.pool.query("DELETE FROM workouts WHERE id=?", [req.query.id], function(err, result){
    mysql.pool.query('SELECT * FROM workouts', function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    var text = '{"dataList" :' + JSON.stringify(rows) + '}';
    context = JSON.parse(text);
    res.render('table', context);
      });
    });
});

app.get('/',function(req,res,next){
  var context;
  mysql.pool.query('SELECT * FROM workouts', function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    var text = '{"dataList" :' + JSON.stringify(rows) + '}';
    context = JSON.parse(text);
    res.render('table', context);
  });
});

app.get('/update',function(req,res,next){
  var context;
  mysql.pool.query("UPDATE workouts SET name=?, reps=?, weight=?, date=?, lbs=? WHERE id=?",
    [req.query.name, req.query.reps, req.query.weight, req.query.date, req.query.lbs, req.query.id],
    function(err, result){
    mysql.pool.query('SELECT * FROM workouts', function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    var text = '{"dataList" :' + JSON.stringify(rows) + '}';
    context = JSON.parse(text);
    res.render('table', context);
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