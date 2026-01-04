const { validationResult } = require('express-validator');

// Validation middleware
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  };
};

// Common validation rules
const commonRules = {
  email: (field = 'email') => [
    body(field)
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format')
      .normalizeEmail()
  ],
  
  password: (field = 'password') => [
    body(field)
      .trim()
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  
  name: (field = 'name') => [
    body(field)
      .trim()
      .notEmpty().withMessage('Name is required')
      .isLength({ min: 2 }).withMessage('Name must be at least 2 characters')
  ],
  
  phone: (field = 'phone') => [
    body(field)
      .trim()
      .notEmpty().withMessage('Phone number is required')
      .matches(/^[0-9]{10}$/).withMessage('Phone must be 10 digits')
  ],
  
  price: (field = 'price') => [
    body(field)
      .notEmpty().withMessage('Price is required')
      .isFloat({ min: 0 }).withMessage('Price must be a positive number')
  ]
};

module.exports = {
  validate,
  ...commonRules
};