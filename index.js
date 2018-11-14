const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config()
const mongoose = require("mongoose");

const app = express();
//const url = process.env.MONGODB;

//mongoose.Promise = global.Promise;
//mongoose.connect(encodeURI(url));

var uristring = 'mongodb://dbuser:korokoro@150.101.171.154:37011/learning-node';

// The http server will listen to an appropriate port, or default to
// port 5000.
//var theport = process.env.PORT || 5000;

// Makes connection asynchronously.  Mongoose will queue up database
// operations and release them when the connection is complete.
mongoose.connect(uristring, function (err, res) {
  if (err) {
  console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
  console.log ('Succeeded connected to: ' + uristring);
  }
});

const articleSchema = new mongoose.Schema({
  title: String,
  articleText: String,
  fullName: String
});

const Article = mongoose.model("Article", articleSchema);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function (request, response) {
  response.render('index')
});

app.listen(app.get('port'), function () {
  console.log('Node app is running on port', app.get('port'));
});

app.get('/articles', function (req, response) {
  Article.find({}, { _id: 0, title: 1, articleText: 1, fullName: 1 }).limit(5).exec(function (err, articles) {
    if (err) return console.error(err);
    response.render('articles', { articles: articles });
  })
})

app.post("/addArticle", (req, res) => {

  /***checking if DB is full(contains five items) remove one item ***/
  Article.find({}).exec(function (err, articles) {
    if (err) return console.error(err);
    if (articles.length >= 5) {
      Article.findOneAndRemove().exec();
    }
  })
  /***********************end of checking***************************/
  const myData = new Article(req.body);
  myData.save()
    .then(item => {
      res.send(`<h2>item with title:<span><i>"${req.body.title}"</i></span> saved to database</h2>
      <a style="font-size:25px" href="/..">Home page</a>`);
    })
    .catch(err => {
      res.status(400).send("unable to save to database");
    });
});
