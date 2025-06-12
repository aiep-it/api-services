const express = require('express');
const router = express.Router();
const { updateUserMetadata } = require('../controllers/userController');

router.post('/update-metadata', updateUserMetadata);

module.exports = router;



// const express = require('express');
// const router = express.Router();
// const userController = require('../controllers/userController');
// const validateRequest = require('../midleware/validateRequest')
// const { createUserSchema } = require('../validations/userRequest');


// router.get('/', userController.getAllUsers);
// router.get('/:id', userController.getUserById);
// router.post('/',validateRequest(createUserSchema) ,userController.createUser);
// router.put('/:id', userController.updateUser);
// router.delete('/:id', userController.deleteUser);

// module.exports = router;
// api-services/routers/userRouter.js