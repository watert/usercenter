var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
  res.status(404).send('respond with a resource');
});

module.exports = router;
