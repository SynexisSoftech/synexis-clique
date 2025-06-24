import { body, validationResult, ValidationChain } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Stronger password validation regex:
// At least 8 characters, one uppercase, one lowercase, one number, one special character
// const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\S]{8,}$/;

export const signupValidationRules = (): ValidationChain[] => [
  body('username')
    .optional()
    .trim()
    .custom((value) => {
      if (value && value.length > 0) {
        if (value.length < 3 || value.length > 30) {
          throw new Error('Username must be 3-30 characters if provided.');
        }
      }
      return true;
    }),
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required.')
    .isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters.'),
  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required.')
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters.'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Invalid email format.').toLowerCase(),
  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(passwordRegex).withMessage('Password must include uppercase, lowercase, number, and special character.'),

  // Photo handling validation: make photo optional
  body().custom((value, { req }) => {
    const { photoBase64, photoUrlInput } = req.body;
    // If photoUrlInput is present, validate it as a URL
    if (photoUrlInput && !/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(photoUrlInput)) {
        throw new Error('Invalid photo URL format.');
    }
    return true;
  }),
  // You might want to add specific length/size limits for photoBase64 here as well.
];


export const verifyOtpRules = (): ValidationChain[] => [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Invalid email format.').toLowerCase(),
  body('otp')
    .trim()
    .notEmpty().withMessage('OTP is required.')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits.')
    .isNumeric().withMessage('OTP must be numeric.'),
];

// For verifyOtpAndCreateUser, which expects tempUserData
export const verifyOtpAndCreateUserRules = (): ValidationChain[] => [
  ...verifyOtpRules(), // Includes email and OTP validation
  body('tempUserData').notEmpty().withMessage('Temporary user data is required.'),
  body('tempUserData.username').optional().trim(), // Make username optional
  body('tempUserData.email').trim().isEmail().withMessage('Invalid email in temporary data.').toLowerCase(),
  body('tempUserData.password').notEmpty().withMessage('Hashed password in temporary data is required.'),
  body('tempUserData.photoURL')
    .optional() // Make photoURL optional
    .isURL().withMessage('Invalid photo URL format.'), // This rule is still relevant as photoURL will be the final URL
  body('email').custom((value, { req }) => {
    if (req.body.tempUserData && value !== req.body.tempUserData.email) {
      throw new Error('Primary email and temporary user data email must match.');
    }
    return true;
  }),
];

export const loginValidationRules = (): ValidationChain[] => [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Invalid email format.').toLowerCase(),
  body('password')
    .notEmpty().withMessage('Password is required.'),
];

export const emailOnlyRules = (): ValidationChain[] => [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Invalid email format.').toLowerCase(),
];

export const resetPasswordRules = (): ValidationChain[] => [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Invalid email format.').toLowerCase(),
  body('otp')
    .trim()
    .notEmpty().withMessage('OTP is required.')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits.') // Adjust if OTP length differs for password reset
    .isAlphanumeric().withMessage('OTP must be alphanumeric.'), // Password reset OTPs are often alphanumeric
  body('newPassword')
    .notEmpty().withMessage('New password is required.')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters.')
    .matches(passwordRegex).withMessage('New password must include uppercase, lowercase, number, and special character.'),
];

export const updateProfileRules = (): ValidationChain[] => [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters.'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters.'),
  body('photoBase64')
    .optional()
    .isString().withMessage('Photo must be a valid base64 string.'),
];

export const changePasswordRules = (): ValidationChain[] => [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required.'),
  body('newPassword')
    .notEmpty().withMessage('New password is required.')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters.')
    .matches(passwordRegex).withMessage('New password must include uppercase, lowercase, number, and special character.'),
];

// Middleware to handle validation results
export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors: Record<string, string>[] = [];
  errors.array().map(err => {
    if (err.type === 'field') {
        extractedErrors.push({ [err.path]: err.msg });
    }
  });

  res.status(400).json({
    message: 'Validation failed',
    errors: extractedErrors,
  });
};