const express = require('express');
const bodyParser = require('body-parser');
const jwtExpress = require('express-jwt');
const jwt = require('jsonwebtoken');
const Auth0 = require('auth0-js');
const validator = require('validator');
const isUndefined = require('is-undefined');

const db = require('./db');
const port = 8080;

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(bodyParser.text());

// Allow CORS for development (update with server IP for production)
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

app.use(/^\/private/, jwtExpress({
  secret: '0oEcKC1djroFcD4b8XROnlcmf6m5oscoNip_E1NP1IMefDqgB_gtkgM77yj2eHwm',
  audience: 'AqbSSDV0WpHXbu0Re4GpvVvJ5sDZqgnh'
}));

app.listen(port, () => {
  console.log('Listening on port ' + port);
});

app.get('/public/getUserTweets', (req, res) => {
  const username = req.query.username;
  if(isUndefined(username) || !validator.isAlphanumeric(username)){
    res.status(422).send('Invalid username parameter');
  }
  db.getUserTweets(res, username);
});

app.get('/public/getUsernames', (req, res) => {
  const username = req.query.username;
  if(isUndefined(username) || !validator.isAlphanumeric(username)){
    res.status(422).send('Invalid username parameter');
  }
  db.getUsernames(res, username);
});

app.post('/private/initUser', (req, res) => {
  const user = req.body;
  const email = user.email;
  const username = user.username;
  if(isUndefined(email) ||  !validator.isEmail(email)
     || isUndefined(username) || !validator.isAlphanumeric(username)){
    res.status(422).send('Invalid User data');
  }
  const id = req.user.sub;
  db.initUser(res, id, email, username);
});

app.post('/private/addTweet', (req, res) => {
  const text = req.body;
  if(isUndefined(text) || !validator.isAlphanumeric(text)){
    res.status(422).send('Invalid request body');
  }
  const userId = req.user.sub;
  db.addTweet(res, userId, text);
});

app.post('/private/addSubscription', (req, res) => {
  const username = req.body;
  if(isUndefined(username) ||  !validator.isAlphanumeric(username)){
    res.status(422).send('Invalid request body');
  }
  const subscriberId = req.user.sub;
  db.addSubscriptionByUsername(res, username, subscriberId);
});

app.delete('/private/deleteSubscription', (req, res) => {
  const subscriptionId = req.query.id;
  if(isUndefined(subscriptionId) || !validator.isInt(subscriptionId)){
    res.status(422).send('Invalid subscription id parameter');
  }
  const subscriberId = req.user.sub;
  db.deleteSubscription(res, subscriptionId, subscriberId);
});

app.get('/private/getUserSubscriptions', (req, res) => {
  const userid = req.user.sub;
  db.getUserSubscriptions(res, userid);
});

app.get('/private/getUserFeed', (req, res) => {
  const userid = req.user.sub;
  db.getUserFeed(res, userid);
});