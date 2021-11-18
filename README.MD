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
- [x] check if user.isVerified, if not 401
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
  - [x] check token is valid, if not 401
  - [x] refreshToken = existingToken
  - [x] attachCookiesToResponse
  - [x] return status ok with tokenUser
- [x] create new refreshToken
- [x] get user-agent
- [x] create userToken
  - [x] ip
  - [x] refreshToken
  - [x] userAgent
  - [x] user id
- [x] attachCookiesToResponse
- [x] return response ok with userToken

#### Send Multiple Cookies

- attachCookiesToResponse utils- jwt
- [x] accessTokenJWT
- [x] refreshTokenJWT

#### Create Auth Middleware - Access , Refresh Token

- [x] create auth middleware
  - [x] create authenticateUser and authorizePermissions
- [x]add dashboard route to test auth middleware

#### Refactor Logout

- [x] remove cookies when logging out

#### Forgot/Reset Password Functionality

- [x] Update User Model
  - [x] passwordToken {type:String}
  - [x] passwordTokenExpirationDate {type:Date}
- [x] Update authController
  - [x] forgotPassword and resetPassword
- [x] Update authRoutes
  - [x] post '/forgot-password' '/reset-password'

#### Forgot Password Controller

- [x] check valid email
- [x] find user
- [x] if valid user
  - [x] generate a passwordToken
  - [x] send password reset email
  - [x] set passwordTokenExpirationDate
  - [x] has password token
  - [x] save to user
- [x] send ok status with msg

#### Reset Password Controller

- [x] check for token, email and password, if not 404
- [x] find user by email
- [x] if user
  - [x] check if token has expired
  - [x] get current date
  - [x] If check password token matches &&
  - [x] If check token has not expired
    - [x] update users password
    - [x] set password token to null
    - [x] set passwordTokenExpirationDate to null
    - [x] save user
- [x] return response password reset

#### User Routes Structure

- [x] add userController file
- [x] export (getAllUsers,getUserById,showCurrentUser,updateUser,updateUserPassword) functions
- [x] res.send('some string value')
- [x] setup userRoutes file
- [x] import all controllers
- [x] import userRoutes as userRouter in the app.js
- [x] setup app.use('/api/v1/users', userRouter)

#### GetAllUsers and GetSingleUser

- [x] Get all users and remove password
- [x] Get Single User where id matches id param and remove password
  - [x] throw error if invalid id
  - [x] If no user 404

#### ShowCurrentUser

- [x] get user from req
- [x] send response with user

#### UpdateUserPassword

- [x] almost identical to login user
- [x] add authenticateUser middleware in the route
- [x] check for oldPassword and newPassword in the body
- [x] if one missing 400
- [x] look for user with req.user.userId
- [x] check if oldPassword matches with user.comparePassword
- [x] if no match 401
- [x] if everything good set user.password equal to newPassword
- [x] await user.save()

#### createTokenUser in Utils

- [x] create a file in utils (createTokenUser)
- [x] setup a function that accepts user object and returns userToken object
- [x] export as default
- [x] setup all the correct imports/exports

#### updateUser with user.save()

- [x] add authenticateUser middleware in the route
- [x] check for name and email in the body
- [x] if one is missing, send 400 (optional)
- [x] use user.save() to trigger the UserSchema.pre('save') - hook
- [x] create token user, attachCookiesToResponse and send back the tokenUser

#### get logged in user tokens

- [x] create GetUserTokens
- [x] if no id passed get logged in users tokens
- [x] if id is passed find the tokens for that users id

#### revoke all tokens -- TODO

#### revoke a single device token -- TODO

#### Setup and Apply checkPermissions()

- [x] first user created is a admin
- [x] create checkPermissions in ultis
- [x] create authorizePermissions middleware
- [] only admin can get all users list
- [] users can cannot get other users by ID unless they are admin

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
