var express = require('express');
var AWS = require('aws-sdk');

var dynamodb = new AWS.DynamoDB();

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var bodyParser = require('body-parser');
var request = require('request');
var multer = require('multer');
var upload = multer();

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 3000);
app.use(express.static('public'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));

var docClient = new AWS.DynamoDB.DocumentClient();

app.get('/', function(req,res){
  res.send("Hello");
});

// GET

app.get('/getLocations', function(req, res){
  var email = req.query.email;

  var params = {
      TableName: "Location",
      KeyConditionExpression: "#email = :email",
      ExpressionAttributeNames:{
          "#email": "email"
      },
      ExpressionAttributeValues:{
          ":email": email
      }
  };
  docClient.query(params, function(err, data) {
    if (err) {
        console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        res.status(404).send("Unable to get Locations");
    } else {
        console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
        res.status(200).json(data);
    }
  });
});


// POSTS

app.post('/addLocation', upload.array(),function(req,res){

  console.log("Importing Location into DynamoDB. Please wait.");
  var email = req.body.email;
  var datetime = req.body.datetime;
  var lon = req.body.longitude;
  var lat = req.body.latitude;

  console.log("email: " + email + ", datetime: " + datetime + ", longitude " + lon + ", latitude" + lat + "\n");

  var params = {
      TableName: "Location",
      Item: {
          "email":  email,
          "datetime": parseFloat(datetime),
          "longitude":  parseFloat(lon),
          "latitude": parseFloat(lat)
      }
  };

  docClient.put(params, function(err, data) {
     if (err) {
         console.error("Unable to add Location. Error JSON:", JSON.stringify(err, null, 2));
         res.status(404).send("Unable to add Location");
     } else {
        console.log("PutItem succeeded:", email);
        var params = {
        TableName: "Location",
        KeyConditionExpression: "#email = :email",
        ExpressionAttributeNames:{
            "#email": "email"
        },
        ExpressionAttributeValues:{
            ":email": email
        }
      };
      docClient.query(params, function(err, data) {
        if (err) {
          console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
          res.status(404).send("Unable to get Locations");
        } else {
            console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
            res.status(200).json(data);
        }
      });
     }
  });
});

app.post('/signup', upload.array(), function(req,res){

  console.log("Importing User into DynamoDB. Please wait.");
  var email = req.body.email;
  var password = req.body.password;
  var params = {
      TableName: "User",
      Item: {
          "email": email,
          "password": password
      }
  };

  docClient.put(params, function(err, data) {
     if (err) {
         console.error("Unable to add User", email, ". Error JSON:", JSON.stringify(err, null, 2));
         res.status(404).send("Unable to add user");
     } else {
         console.log("PutItem succeeded:", email);
         res.status(200).send("User Added");
     }
  });
});

app.post('/login', upload.array(), function(req, res){
  var email = req.body.email;
  var password = req.body.password;

  var params = {
      TableName: "User",
      Key:{
          "email": email
      }
  };
  docClient.get(params, function(err, data) {
    if (err) {
        console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        res.status(404).send("Invalid");
    } else {
        if(data != null){
          var storedPass = JSON.stringify(JSON.parse(data.Item.password));
          if (storedPass == password){
            console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
            res.status(200).json({ "email": email });
          }else{
            res.status(404).send("Invalid");
          }
        }  
    }
  });
});

// PUT

app.put('/updateLocation', upload.array(), function(req, res){
  var email = req.body.email;
  var datetime = req.body.datetime;
  var lon = req.body.longitude
  var lat = req.body.latitude;

  var params = {
    TableName:"Location",
    Key:{
        "email": email,
        "datetime": parseFloat(datetime)
    },
    UpdateExpression: "set longitude = :lon, latitude = :lat",
    ExpressionAttributeValues:{
        ":lon": parseFloat(lon),
        ":lat": parseFloat(lat)
    },
    ReturnValues:"UPDATED_NEW"
  };

  console.log("Attempting a conditional update...");
  docClient.update(params, function(err, data) {
      if (err) {
          console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
          res.status(404).send("Unable to Update");
      } else {
          console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
          var params = {
            TableName: "Location",
            KeyConditionExpression: "#email = :email",
            ExpressionAttributeNames:{
                "#email": "email"
            },
            ExpressionAttributeValues:{
                ":email": email
            }
          };
          docClient.query(params, function(err, data) {
            if (err) {
              console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
              res.status(404).send("Unable to get Locations");
            } else {
                console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
                res.status(200).json(data);
            }
          });
      }
  });
});

//Delete

app.delete('/deleteLocation', function(req, res){
  var email = req.query.email;
  var datetime = req.query.datetime;
  var params = {
      TableName:"Location",
      Key:{
          "email": email,
          "datetime": parseFloat(datetime)
      }
  };

  console.log("Attempting a conditional delete...");
  docClient.delete(params, function(err, data) {
      if (err) {
          console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
          res.status(404).send("Unable to Delte");
      } else {
          console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
          var params = {
            TableName: "Location",
            KeyConditionExpression: "#email = :email",
            ExpressionAttributeNames:{
                "#email": "email"
            },
            ExpressionAttributeValues:{
                ":email": email
            }
          };
          docClient.query(params, function(err, data) {
            if (err) {
              console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
              res.status(404).send("Unable to get Locations");
            } else {
                console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
                res.status(200).json(data);
            }
          });
      }
  });
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});