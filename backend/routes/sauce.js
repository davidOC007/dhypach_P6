const express = require('express');
const router = express.Router();
const sauceCtrl = require('../controllers/sauce');

const auth = require('../middleware/auth');
const multer = require('../middleware/multer');
const regexSauce = require('../middleware/regexSauce');

router.post('/', auth, multer, regexSauce, sauceCtrl.createSauce);
router.get('/', auth, sauceCtrl.allSauces);
router.get('/:id', auth, sauceCtrl.oneSauce);
router.put('/:id', auth, multer, regexSauce, sauceCtrl.modifySauce);
router.delete('/:id', auth, sauceCtrl.deleteSauce);
router.post('/:id/like', auth, sauceCtrl.modifyLike);

module.exports = router;