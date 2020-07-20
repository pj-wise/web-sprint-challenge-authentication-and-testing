const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt =require('jsonwebtoken');

const Users = require('./auth-model.js');
const secrets = require('../config/secrets.js');

router.post('/register', (req, res) => {
  let user = req.body;
  if(user.username && user.password){

    const hash = bcrypt.hashSync(user.password, 6);
    user.password = hash;
    
    Users.add(user)
    .then(saved => {
      res.status(201).json(saved);
    })
    .catch(error => {
      res.status(500).json(error);
    });
  } else{
    res.status(400).json({ message: 'Please submit a username and password' });
  }
});

router.post('/login', (req, res) => {
  let { username, password } = req.body;

  if(username && password){ 
    Users.findBy({ username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        const token = generateToken(user);
        res.status(200).json({
          message: `Welcome ${user.username}!`,
          token: token
        });
      } else {
        res.status(401).json({ message: 'Invalid username and/or password' });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
  } else {
    res.status(400).json({ message: 'Please submit a username and password' });
  }
  });

function generateToken(user){
  const payload = {
    username: user.username,
    subject: user.id,
  };
  const options = {
    expiresIn: '1d',
  };

  return jwt.sign(payload, secrets.jwtSecret, options);
};

module.exports = router;
