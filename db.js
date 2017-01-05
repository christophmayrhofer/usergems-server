const pg = require('pg');
const pgConfig = require('./pg.config');

module.exports.initUser = (res, user) => {
  const client = new pg.Client(pgConfig);
  client.connect();
  const sql = `INSERT INTO users ("id", "email", "username")
                SELECT $1, $2, $3
                WHERE NOT EXISTS (
                  SELECT id, email, username
                FROM users
                WHERE id=$1 AND email = $2 AND username = $3
                )
                returning id`;
  const values = [user.id, user.email, user.username];
  const query = client.query(sql, values)
  query.on('end', (data) => {
    client.end();
    console.log(data.rows);
    return res.json(data.rows);
  });
}

module.exports.addTweet = (res, tweet) => {
  const client = new pg.Client(pgConfig);
  client.connect();
  const sql = `INSERT INTO tweets ("userid", "text", "timestamp") VALUES($1, $2, $3)`;
  const values = [tweet.userId, tweet.text, new Date().toISOString()];
  const query = client.query(sql, values)
  query.on('end', (data) => {
    client.end();
    console.log(data.rows);
    return res.json(data.rows);
  });
}

module.exports.getUserTweets = (res, username) => {
  const client = new pg.Client(pgConfig);
  client.connect();
  const sql = `SELECT u.username, t.text, t.timestamp
              FROM users u, tweets t
              WHERE u.id = t.userid
              AND u.username = $1
              ORDER BY timestamp
              LIMIT 100`;
  const values = [username];
  const query = client.query(sql, values)
  query.on('end', (data) => {
    client.end();
    console.log(data.rows);
    return res.json(data.rows);
  });
}

module.exports.addSubscriptionByUsername = (res, username, subscriberId) => {
  console.log('subscribe to: ' + username);

  const client = new pg.Client(pgConfig);
  client.connect();
  const sql = `SELECT id from users WHERE username = $1 LIMIT 1`;
  const values = [username];
  const query = client.query(sql, values);

  query.on('end', (data) => {
    if(data.rows.length < 1) {
      client.end();
      return res.json(data.rows);
    }

    const userId = data.rows[0].id;
    console.log('subscribe to: ' + userId);

    const sql2 = `INSERT INTO subscriptions (subscriberid, userid)
                SELECT $1, $2
                WHERE NOT EXISTS (
                  SELECT subscriberid, userid
                  FROM subscriptions
                  WHERE subscriberid = $1 AND userid = $2
                )
                returning id`;
    const values2 = [subscriberId, userId];
    const query2 = client.query(sql2, values2);
    query2.on('end', (data) => {
      client.end();
      return res.json(data.rows);
    });
  });
}

module.exports.deleteSubscription = (res, subscriptionId, subscriberId) => {
  console.log(subscriptionId, subscriberId);
  const client = new pg.Client(pgConfig);
  client.connect();
  const sql = `DELETE FROM subscriptions WHERE id = $1 AND subscriberid = $2 RETURNING id`;
  const values = [subscriptionId, subscriberId];
  const query = client.query(sql, values)
  query.on('end', (data) => {
    client.end();
    console.log(data.rows);
    return res.json(data.rows);
  });
}

module.exports.getUserSubscriptions = (res, userid) => {
  const client = new pg.Client(pgConfig);
  client.connect();
  const sql = `SELECT s.id, u.username
              FROM subscriptions s, users u
              WHERE subscriberid = $1
              AND u.id = s.userId
              LIMIT 100`;
  const values = [userid];
  const query = client.query(sql, values)
  query.on('end', (data) => {
    client.end();
    console.log(data.rows);
    return res.json(data.rows);
  });
}

module.exports.getUserFeed = (res, userid) => {
  const client = new pg.Client(pgConfig);
  client.connect();
  const sql = `SELECT u.username, t.text, t.timestamp 
               FROM users u, tweets t
                WHERE u.id = t.userid
                AND userid IN
                  (SELECT userid FROM subscriptions WHERE subscriberid = $1)`;
  const values = [userid];
  const query = client.query(sql, values)
  query.on('end', (data) => {
    client.end();
    console.log(data.rows);
    return res.json(data.rows);
  });
}