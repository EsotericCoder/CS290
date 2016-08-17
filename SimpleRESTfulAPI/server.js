var express = require('express');
var AWS = require('aws-sdk');

var dynamodb = new AWS.DynamoDB();

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var bodyParser = require('body-parser');
var request = require('request');

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 3000);
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

var docClient = new AWS.DynamoDB.DocumentClient();

app.get('/', function(req,res){
  res.send("Hello");
});

// GET

app.get('/getBrand', function(req, res){
  var name = req.query.name;

  var params = {
      TableName: "Brand",
      Key:{
          "name": name
      }
  };
  docClient.get(params, function(err, data) {
    if (err) {
        console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
        res.send(data);
    }
  });
});

app.get('/getModel', function(req, res){
  var name = req.query.name;

  var params = {
      TableName: "Brand",
      Key:{
          "name": name
      }
  };
  docClient.get(params, function(err, data) {
    if (err) {
        console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
        res.send(data);
    }
  });
});

// POSTS

app.post('/addBrand',function(req,res){

  console.log("Importing Brand into DynamoDB. Please wait.");
  var name = req.query.name;
  var country = req.query.country;
  var syear = req.query.syear;
  var eyear = req.query.eyear;

  console.log("Name: " + name + ", Country: " + country + ", Years " + syear + "-" + eyear + "\n");

  var params = {
      TableName: "Brand",
      Item: {
          "name":  name,
          "country": country,
          "startYear":  syear,
          "endYear": eyear
      }
  };

  docClient.put(params, function(err, data) {
     if (err) {
         console.error("Unable to add Brand", name, ". Error JSON:", JSON.stringify(err, null, 2));
     } else {
         console.log("PutItem succeeded:", name);
         res.send(data);
     }
  });
});

app.post('/addModel',function(req,res){

  console.log("Importing Model into DynamoDB. Please wait.");
  var model = req.query.model;
  var make = req.query.make;
  var engine = req.query.engine;
  var syear = req.query.syear;
  var eyear = req.query.eyear;
  var msrp = req.query.msrp;

  console.log("model: " + model + ", make: " + make + ", Years " + syear + "-" + eyear + "\n");

  var params = {
      TableName: "Model",
      Item: {
          "model":  model,
          "make": make,
          "engineSize": engine,
          "startYear":  syear,
          "endYear": eyear,
          "msrp": msrp
      }
  };

  docClient.put(params, function(err, data) {
     if (err) {
         console.error("Unable to add Model", model, ". Error JSON:", JSON.stringify(err, null, 2));
     } else {
         console.log("PutItem succeeded:", model);
         res.send(data);
     }
  });
});

// PUT

app.put('/updateBrand', function(req, res){
  var name = req.query.name;
  var country = req.query.country;
  var syear = req.query.syear
  var eyear = req.query.eyear;
  var params = {
    TableName:"Brand",
    Key:{
        "name": name
    },
    UpdateExpression: "set country = :c, startYear = :syear, endYear = :eyear",
    ExpressionAttributeValues:{
        ":c": country,
        ":syear": syear,
        ":eyear": eyear
    },
    ReturnValues:"UPDATED_NEW"
  };

  console.log("Attempting a conditional update...");
  docClient.update(params, function(err, data) {
      if (err) {
          console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
      } else {
          console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
          res.send(data);
      }
  });
});

//Delete

app.delete('/deleteModel', function(req, res){
  var model = req.query.model;
  var make = req.query.make;
  var params = {
      TableName:"Model",
      Key:{
          "model": model,
          "make": make
      }
  };

  console.log("Attempting a conditional delete...");
  docClient.delete(params, function(err, data) {
      if (err) {
          console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
      } else {
          console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
          res.send(data);
      }
  });
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});