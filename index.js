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

    app.post('/templates', (req, res) => {
      templatesCollection.insertOne({
          url: shortid.generate(),
          template: req.body.template
      })
        .then(result => {
          res.json(result.ops[0]);
        })  
        .catch(error => console.error(error))
    })


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