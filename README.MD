## Delv boilerplate jsonwebtoken auth API

Goal is to create a boilerplate project for users authentication. With the following functionality

- Reguster a user
- Verify email
- Login
- Forgot/Reset password
- Logout
  </br>
  </br>

- Get all users
- Get single user
- Show current user
- Change password
  </br>
  </br>

#### Setup Basic Express Server

- [x] import express and assign to variable
- [x] setup start port variable (5000) and start function
      </br>

#### Connect To DB

- [x] get connection string
- [x] setup .env with MONGO_URI variable and assign the value
- [x] import 'dotenv' and setup package
- [x] import connectDB() and invoke in the starter
      </br>

#### Basic Routes and Middleware

- [x] setup /test GET Route
- [x] setup express.json() middleware
- [x] setup errorHandler middleware
- [x] setup 404 route not found middleware
- [x] import 'exress-async-errors' package
      </br>

#### Morgan Pacakge

- [Morgan Package](https://www.npmjs.com/package/morgan)

#### User Model

- [x] create models folder and User.js file
- [x] create schema with name,email, password, verificationToken (all type:String), isVerified - {type: Boolean, default: false}, verified type: Date
- [x] export mongoose model

#### Validator Package

- [Validator](https://www.npmjs.com/package/validator)

#### Auth Routes Structure

- [x] create controllers folder
- [x] add authController file
- [x] export (register,login,logout) functions
- [x] res.send('some string value')
- [x] create routes folder
- [x] setup authRoutes file
- [x] import all controllers
- [x] setup three routes
- [x] post('/register') post('/login') get('/logout')
- [x] import authRoutes as authRouter in the app.js
- [x] setup app.use('/api/v1/auth', authRouter)

#### Register Controller

- [x] create user
- [x] setup fake verificationToken - 'fake token' - for verification functionality later
- [x] check if email already in use (schema and controller)
- [x] send response with entire user (only while testing)
- [x] send back success message and token

#### Handle Password

- [x] UserSchema.pre('save') - hook
- this points to User
- bcrypt.genSalt - number of rounds
- bcrypt.hash

#### JWT

- [x] require 'jsonwebtoken' package
- [x] create jwt - jwt.sign(payload,secret,options)
- [x] verify jwt - jwt.verify(token,secret)
- [x] add variables in .env JWT_SECRET=jwtSecret and JWT_LIFETIME=1d
- [x] refactor code, create jwt functions in utils
- [x] refactor cookie code
- [x] setup func attachCookiesToResponse
- [x] accept payload(res, tokenUser)
- [x] create token, setup cookie

#### Login Route

- [x] check if email and password exist, if one missing return 400
- [x] find user, if no user return 401
- [x] check password, if does not match return 401
- [] check if user.isVerified, if not 401 -TODO
- [x] if everything is correct, attach cookie
      and send back the same response as in register

#### Logout Route

- [x] set token cookie equal to some string value
- [x] set expires:new Date(Date.now())

#### Verify Email Controller

- [x] create verifyEmail in authController
- [x] get verificationToken and email from req.body
- [x] setup a '/verify-email' route in authRoutes
- [x] check for user using email
- [x] if no user 401
- [x] if token does not match user token 401
- [x] if correct set
- [x] user.isVerified = true
- [x] user.verified = Date.now()
- [x] user.verificationToken = ''
- [x] save use with instance method
- [x] return msg:'email verified'

#### Email Setup

- [x] ethereal credentials (create account/login)
- [x] install nodemailer
- [x] create (nodemailerConfig, sendEmail,
      sendResetPasswordEmail, sendVerificationEmail) files in utils

#### Send Verification Link

- [x] setup sendEmail
- [x] setup sendVerificationEmail.js
- [x] pass arguments

#### Refresh Token Model

- [x] create Token.js in models
- [x] refreshToken,ip,userAgent - all String and required
- [x] isValid - Boolean, default:true
- [x] ref user
- [x] timestamps true
- [x] attempts Number: default: 0

#### Setup Refresh Token in Login Controller

- [x] create empty refreshToken
- [x] check for existing token
- [x] if existing token
- - [x] check token is valid, if not 401
- - [x] refreshToken = existingToken
- - [x] attachCookiesToResponse
- - [x] return status ok with tokenUser
- [x] create new refreshToken
- [x] get user-agent
- [x] create userToken
- - [x] ip
- - [x] refreshToken
- - [x] userAgent
- - [x] user id
- [x] attachCookiesToResponse
- [x] return response ok with userToken

#### Send Multiple Cookies

- attachCookiesToResponse utils- jwt
- [x] accessTokenJWT
- [x] refreshTokenJWT

#### Create Auth Middleware - Access , Refresh Token

#### Refactor Logout

- [] remove cookies when logging out

#### Forgot/Reset Password Functionality

- User Model
- passwordToken {type:String}
- passwordTokenExpirationDate {type:Date}
- authController
- forgotPassword and resetPassword
- authRoutes
- post '/forgot-password' 'reset-password'

#### Forgot Password Controller

#### Send Reset Password Email

#### Reset Password Controller

#### Hash Password Token

#### User Routes Structure

- [] add userController file
- [] export (getAllUsers,getSingleUser,showCurrentUser,updateUser,updateUserPassword) functions
- [] res.send('some string value')
- [] setup userRoutes file
- [] import all controllers
- [] setup just one route - router.route('/').get(getAllUsers);
- [] import userRoutes as userRouter in the app.js
- [] setup app.use('/api/v1/users', userRouter)

#### GetAllUsers and GetSingleUser

- [] Get all users where role is 'user' and remove password
- [] Get Single User where id matches id param and remove password
- [] If no user 404

#### ShowCurrentUser

- [] get user from req
- [] send response with user

#### UpdateUserPassword

- [] almost identical to login user
- [] add authenticateUser middleware in the route
- [] check for oldPassword and newPassword in the body
- [] if one missing 400
- [] look for user with req.user.userId
- [] check if oldPassword matches with user.comparePassword
- [] if no match 401
- [] if everything good set user.password equal to newPassword
- [] await user.save()

#### createTokenUser in Utils

- [] create a file in utils (createTokenUser)
- [] setup a function that accepts user object and returns userToken object
- [] export as default
- [] setup all the correct imports/exports

#### updateUser with user.save()

- [] add authenticateUser middleware in the route
- [] check for name and email in the body
- [] if one is missing, send 400 (optional)
- [] use user.save() to trigger the UserSchema.pre('save') - hook
- [] create token user, attachCookiesToResponse and send back the tokenUser

#### show User tokens?

#### Setup and Apply checkPermissions()

### TESTS

#### TODO

## Docs, secruity and deploy

#### Create Docs

- [] [Docgen Library] (https://github.com/thedevsaddam/docgen)
- [] Export Postman Collection
- [] docgen build -i fileName.json -o index.html
- [] create index.html in public

#### Security Packages

- [] express-rate-limiter
- [] helmet
- [] xss-clean
- [] express-mongo-sanitize
- [] cors (cookies!!!!)

#### Deploy on Heroku

- [] heroku account and heroku cli
- [] remove/copy from the main repo
- [] add dev command "nodemon app.js"
- [] change start to "node app.js"
- [] setup node version in package.json
- [] "engines": {"node": "16.x"}
- [] Procfile "web: node app.js"
- [] remove existing git repo
- [] git commit latest changes
- [] heroku login
- [] heroku create "App Name"
- [] git remote -v
- [] setup env vars in GUI
- [] git push heroku master/main
