const express = require('express');
const router = express.Router();
const cartController = require('../controllers/controller.cartAvtoNova');
const verifyToken = require('../middlewares/verifytoken');

router.get('/', cartController.cart_get);
// router.get('/', verifyToken, cartController.cart_get);

router.post('/post', verifyToken, cartController.cart_post);

router.put('/cartitem/:id', verifyToken, cartController.cart_update);

router.delete('/cartitem/:id', verifyToken, cartController.cart_deleteCartItem);

router.delete('/:id', verifyToken, cartController.cart_delete);

module.exports = router;
