const express = require('express');
const bodyParser = require('body-parser');
const jwtExpress = require('express-jwt');
const jwt = require('jsonwebtoken');
const Auth0 = require('auth0-js');

const db = require('./db');
const port = 3000;

const app = express();
app.use(bodyParser.urlencoded());
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

app.use(jwtExpress({
  secret: '0oEcKC1djroFcD4b8XROnlcmf6m5oscoNip_E1NP1IMefDqgB_gtkgM77yj2eHwm',
  audience: 'AqbSSDV0WpHXbu0Re4GpvVvJ5sDZqgnh'
}));

app.listen(port, () => {
  console.log('Listening on port ' + port);
});

app.post('/initUser', (req, res) => {
  const user = req.body;
  user.id = req.user.sub;
  db.initUser(res, user);
});

app.post('/addTweet', (req, res) => {
  console.log(req.body);
  const tweet = {
    text: req.body,
    userId: req.user.sub,
  };
  db.addTweet(res, tweet);
});

app.get('/getUserTweets', (req, res) => {
  const username = req.query.username;
  db.getUserTweets(res, username);
});

app.post('/addSubscription', (req, res) => {
  const username = req.body;
  const subscriberId = req.user.sub;
  db.addSubscriptionByUsername(res, username, subscriberId);
});

app.delete('/deleteSubscription', (req, res) => {
  const subscriptionId = req.query.id;
  const subscriberId = req.user.sub;
  db.deleteSubscription(res, subscriptionId, subscriberId);
});

app.get('/getUserSubscriptions', (req, res) => {
  const userid = req.user.sub;
  db.getUserSubscriptions(res, userid);
});

app.get('/getUserFeed', (req, res) => {
  const userid = req.user.sub;
  db.getUserFeed(res, userid);
});