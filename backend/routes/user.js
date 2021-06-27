const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');

const max = require("../middleware/limit")
const regexUser = require('../middleware/regexUser');


router.post('/signup', regexUser, userCtrl.signup);
router.post('/login', max.limiter, userCtrl.login);

module.exports = router;