const express = require("express");
const app = express();
const shortid = require('shortid');
const path = require("path");
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');


// ========================
// Link to Database
// ========================
// Updates environment variables
// @see https://zellwk.com/blog/environment-variables/

// Replace process.env.DB_URL with your actual connection string
const connectionString = "mongodb+srv://linkylink:a1FZayN6sD93ljFL@cluster0-tbyld.mongodb.net/linkylinkdb?retryWrites=true&w=majority";
// const uri = "mongodb+srv://linkylink:<password>@cluster0-tbyld.mongodb.net/<dbname>?retryWrites=true&w=majority";
// const connectionString = "mongodb://localhost/mailtodb";

MongoClient.connect(connectionString, { useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to Database')
    const db = client.db('mailtodb')
    const templatesCollection = db.collection('templates')
    const urlCollection = db.collection('url')
    // ========================
    // Middlewares
    // ========================
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(bodyParser.json())
    app.use(express.static('assets'));



    // ========================
    // Routes
    // ========================
    app.get('/', function(req, res) {
      res.sendFile(path.join(__dirname + '/views/index.html'));
    });

    app.get('/url', function(req, res) {
      res.sendFile(path.join(__dirname + '/views/url.html'));
    });


    // ========================
    // URL Shortener Routes
    // ========================

    app.post('/url', (req, res) => {
      console.log(req);
      let shorturl;
      // If an alias isn't provided, generate a short id.
      if (req.body.alias && req.body.alias.length !== 0) {
        shorturl = req.body.alias;
      } else {
        shorturl = shortid.generate();
      }

      // Insert alias link into URL collection.
      urlCollection.insertOne({
          url: shorturl,
          longUrl: req.body.longUrl
      }).then(result => {
          res.json(result.ops[0]);
        })  
        .catch(error => console.error(error))
    })

    app.get('/url/:alias', (req, res) => {
      db.collection('url').findOne({"url": req.params.alias })
        .then(url => {
          res.redirect(url.longUrl);
        });
    })

    // ========================
    // Mailto Routes
    // ========================

    // POST
    app.post('/templates', (req, res) => {
      templatesCollection.insertOne({
          url: shortid.generate(),
          template: req.body.template
      }) .then(result => {
          res.json(result.ops[0]);
        })  
        .catch(error => console.error(error))
    })

    // GET  
    // @params id 
    app.get('/templates/:id', (req, res) => {
      db.collection('templates').findOne({"url": req.params.id })
        .then(templates => {
          res.redirect(templates.template);
        });
    })

    // ========================
    // Listen
    // ========================

    const port = 3000;
    app.listen(port, function () {  
      console.log(`listening on ${port}`)
    })
  })
  .catch(console.error)