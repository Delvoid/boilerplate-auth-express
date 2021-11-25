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
- Update user
- Get user tokens
  </br>
  </br>

### Installation

1. Create mongoDB and setup [MongoDB](https://www.mongodb.com/)
2. Clone the repo
   ```sh
   git clone https://github.com/Delvoid/boilerplate-auth-express.git
   ```
3. Install NPM packages
   ```sh
   npm install
   ```
4. Enter your MongoDB API's in .env

   ```js
      MONGO_URI = ENTER YOUR MONOGO API
      JWT_SECRET= YOUR SECRET
      JWT_LIFETIME= LIFETIME
   ```

   Run the tests

   ```js
   npm test
   ```

   Start the dev server

   ```js
   npm run dev
   ```

<p align="right">(<a href="#top">back to top</a>)</p>

## Roadmap

  </br>

<details>
<summary>Setup Basic Express Server</summary>

- [x] import express and assign to variable
- [x] setup start port variable (5000) and start function
    </br>
</details>

<details>
<summary>Connect To DB</summary>

- [x] get connection string
- [x] setup .env with MONGO_URI variable and assign the value
- [x] import 'dotenv' and setup package
- [x] import connectDB() and invoke in the starter
    </br>
</details>

<details>
<summary>Basic Routes and Middleware</summary>

- [x] setup /test GET Route
- [x] setup express.json() middleware
- [x] setup errorHandler middleware
- [x] setup 404 route not found middleware
- [x] import 'exress-async-errors' package
    </br>
</details>

#### Morgan Pacakge

- [Morgan Package](https://www.npmjs.com/package/morgan)

<details>
<summary>User Model</summary>

- [x] create models folder and User.js file
- [x] create schema with name,email, password, verificationToken (all type:String), isVerified - {type: Boolean, default: false}, verified type: Date
- [x] export mongoose model
      </br>

</details>

#### Validator Package

- [Validator](https://www.npmjs.com/package/validator)

<details>
<summary>Auth Routes Structure</summary>

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
      </br>

</details>

<details>
<summary>Register Controller</summary>

- [x] create user
- [x] setup fake verificationToken - 'fake token' - for verification functionality later
- [x] check if email already in use (schema and controller)
- [x] send response with entire user (only while testing)
- [x] send back success message and token
      </br>

</details>

<details>
<summary>Handle Password</summary>

- [x] UserSchema.pre('save') - hook
- this points to User
- bcrypt.genSalt - number of rounds
- bcrypt.hash
  </br>

</details>

<details>
<summary>JWT</summary>

- [x] require 'jsonwebtoken' package
- [x] create jwt - jwt.sign(payload,secret,options)
- [x] verify jwt - jwt.verify(token,secret)
- [x] add variables in .env JWT_SECRET=jwtSecret and JWT_LIFETIME=1d
- [x] refactor code, create jwt functions in utils
- [x] refactor cookie code
- [x] setup func attachCookiesToResponse
- [x] accept payload(res, tokenUser)
- [x] create token, setup cookie
      </br>

</details>

<details>
<summary>Login Route</summary>

- [x] check if email and password exist, if one missing return 400
- [x] find user, if no user return 401
- [x] check password, if does not match return 401
- [x] check if user.isVerified, if not 401
- [x] if everything is correct, attach cookie
      and send back the same response as in register
      </br>

</details>

<details>
<summary>Logout Route</summary>

- [x] set token cookie equal to some string value
- [x] set expires:new Date(Date.now())
      </br>

</details>

<details>
<summary>Verify Email Controller</summary>

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
      </br>

</details>

<details>
<summary>Email Setup</summary>

- [x] ethereal credentials (create account/login)
- [x] install nodemailer
- [x] create (nodemailerConfig, sendEmail,
      sendResetPasswordEmail, sendVerificationEmail) files in utils
      </br>

</details>

<details>
<summary>Send Verification Link</summary>

- [x] setup sendEmail
- [x] setup sendVerificationEmail.js
- [x] pass arguments
      </br>

</details>

<details>
<summary>Refresh Token Model</summary>

- [x] create Token.js in models
- [x] refreshToken,ip,userAgent - all String and required
- [x] isValid - Boolean, default:true
- [x] ref user
- [x] timestamps true
- [x] attempts Number: default: 0
      </br>

</details>

<details>
<summary>Setup Refresh Token in Login Controller</summary>

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
      </br>

</details>

<details>
<summary>Send Multiple Cookies</summary>

- attachCookiesToResponse utils- jwt
- [x] accessTokenJWT
- [x] refreshTokenJWT
      </br>

</details>

<details>
<summary>Create Auth Middleware - Access , Refresh Token</summary>

- [x] create auth middleware
  - [x] create authenticateUser and authorizePermissions
- [x]add dashboard route to test auth middleware
  </br>

</details>

<details>
<summary>Refactor Logout</summary>

- [x] remove cookies when logging out
      </br>

</details>

<details>
<summary>Forgot/Reset Password Functionality</summary>

- [x] Update User Model
  - [x] passwordToken {type:String}
  - [x] passwordTokenExpirationDate {type:Date}
- [x] Update authController
  - [x] forgotPassword and resetPassword
- [x] Update authRoutes
  - [x] post '/forgot-password' '/reset-password'
      </br>
  </details>

<details>
<summary>Forgot Password Controller</summary>

- [x] check valid email
- [x] find user
- [x] if valid user
  - [x] generate a passwordToken
  - [x] send password reset email
  - [x] set passwordTokenExpirationDate
  - [x] has password token
  - [x] save to user
- [x] send ok status with msg
      </br>

</details>

<details>
<summary>Reset Password Controller</summary>

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
      </br>

</details>

<details>
<summary>User Routes Structure</summary>

- [x] add userController file
- [x] export (getAllUsers,getUserById,showCurrentUser,updateUser,updateUserPassword) functions
- [x] res.send('some string value')
- [x] setup userRoutes file
- [x] import all controllers
- [x] import userRoutes as userRouter in the app.js
- [x] setup app.use('/api/v1/users', userRouter)
      </br>

</details>

<details>
<summary>GetAllUsers and GetSingleUser</summary>

- [x] Get all users and remove password
- [x] Get Single User where id matches id param and remove password
  - [x] throw error if invalid id
  - [x] If no user 404
        </br>

</details>

<details>
<summary>ShowCurrentUser</summary>

- [x] get user from req
- [x] send response with user
      </br>

</details>

<details>
<summary>UpdateUserPassword</summary>

- [x] almost identical to login user
- [x] add authenticateUser middleware in the route
- [x] check for oldPassword and newPassword in the body
- [x] if one missing 400
- [x] look for user with req.user.userId
- [x] check if oldPassword matches with user.comparePassword
- [x] if no match 401
- [x] if everything good set user.password equal to newPassword
- [x] await user.save()
      </br>

</details>

<details>
<summary>CreateTokenUser in Utils</summary>

- [x] create a file in utils (createTokenUser)
- [x] setup a function that accepts user object and returns userToken object
- [x] export as default
- [x] setup all the correct imports/exports
      </br>

</details>

<details>
<summary>updateUser with user.save()</summary>

- [x] add authenticateUser middleware in the route
- [x] check for name and email in the body
- [x] if one is missing, send 400 (optional)
- [x] use user.save() to trigger the UserSchema.pre('save') - hook
- [x] create token user, attachCookiesToResponse and send back the tokenUser
      </br>

</details>

<details>
<summary>get logged in user tokens</summary>

- [x] create GetUserTokens
- [x] if no id passed get logged in users tokens
- [x] if id is passed find the tokens for that users id
      </br>

</details>

#### revoke all tokens -- TODO

#### revoke a single device token -- TODO

<details>
<summary>Setup and Apply checkPermissions()</summary>

- [x] first user created is a admin
- [x] create checkPermissions in ultis
- [x] create authorizePermissions middleware
- [x] only admin can get all users list
- [x] users can cannot get other users by ID unless they are admin
      </br>

</details>
</br>

<p align="right">(<a href="#top">back to top</a>)</p>

### TESTS

<details>
<summary>Setup</summary>

- [x] install supertest
- [x] install smtp-server
- [x] create tests folder
- [x] refacter app.js for supertest
- [x] create package script test

</details>

<details>
<summary>Register User</summary>

- [x] beforeAll connect to DB
- [x] afterAll disconnect from DB
- [x] afterEach delete users
- [x] returns 200 on valid requests
- [x] returns Success! Please check your email to verify account on valid requests
- [x] returns badRequest is email already in use with message
- [x] returns 400 if name email missing
- [x] returns 400 if name name missing
- [x] returns 400 if name password missing
- [x] returns validationErrors field in response body when validation error occurs
- [x] returns error for when name, password and email are null
- [x] creates user unverified
- [x] creates an activation token for user
- [x] password is hashed
- [x]Password must have at least 1 uppercase, 1 lowercase letter and 1 number
- [x] email sent with verificationToken
- [x] returns 502 when sending email fails
- [x] does not save user to dabase if activation email fails
- [x] first user is created has a role of admin
- [x] second user is created has a role of user

</details>

<details>
<summary>Verify Email</summary>

- [x] verifies the email when correct token is sent
- [x] removes the token from user table after successful verification
- [x] sets the verified date after successful verification
- [x] returns msg with Email verified on successful verification and 200 status
- [x] does not verify email with incorrect token and returns 401
- [x] returns unauthorised request when token is wrong
- [x] returns unauthorised request when email is wrong

</details>

<details>
<summary>Error Model</summary>

- [x] returns path, timestamp, message and validationErrors in response when validation failure
- [x] returns path, timestamp and message in response when request fails other than validation error
- [x] returns path in error body
- [x] returns timestamp in milliseconds within 5 seconds value in error body

</details>

<details>
<summary>Login</summary>

- [x] returns 200 when credentials are correct
- [x] returns tokenUser: name, userId, role when login success
- [x] attach cookie if login is successful
- [x] returns 401 if user not exist
- [x] returns correct error body when auth fails
- [x] returns 401 when password does not match
- [x] returns 401 when e-mail is not valid
- [x] returns 401 when password is not valid
- [x] returns 400 when e-mail is missing
- [x] returns 400 when password is missing
- [x] returns 401 when logging in with an unverified account

</details>

<details>
<summary>Logout</summary>

- [x] returns 401 ok when unathorized request send for logout
- [x] removes tokens from database
- [x] removes stored cookies

</details>

<details>
<summary>Forgot password</summary>

- [x] return 200 with msg
- [x] creates password reset token on valid email and user
- [x] creates passwordTokenExpirationDate on valid user
- [x] return 400 if invalid email
- [x] sends email if valid user is found
- [x] returns 502 when bad gateway when sending email fails

</details>

<details>
<summary>Reset password</summary>

- [x] returns 403 when password update request does not have the valid password reset token
- [x] returns 400 when trying to update with invalid password and the reset token is valid
- [x] returns 200 when valid password is sent with valid reset token
- [x] updates the password in database when the request is valid
- [x] clears the reset token in database when the request is valid
- [x] verifys email if unverified after valid password reset

</details>

<details>
<summary>Get users</summary>

- [x] returns 403 if not authorised
- [x] returns 200 when valid auth and role admin
- [x] returns users list when valid auth and role admin

</details>

<details>
<summary>Get single user</summary>

- [x] returns 404 when user is not found
- [x] returns correct error body when user not found
- [x] returns 200 on valid user when admin
- [x] returns 401 when basic user tries to get another user

</details>

<details>
<summary>Get current user</summary>

- [x] returns 401 if not authorised
- [x] returns 200 and logged in user object without password if authorised

</details>

<details>
<summary>Update password</summary>

- [x] returns 200 with msg on valid request
- [x] returns 400 if oldPassword is missing
- [x] returns 400 if newPassword is missing
- [x] returns 401 if passwords do not match
- [x] returns 400 if password is not pass validation
- [x] updates the password in database when the request is valid

</details>

<details>
<summary>Update User</summary>

- [x] returns 401 when request without basic auth
- [x] returns 200 with msg on valid request
- [x] returns 400 if name is missing
- [x] returns 400 if email is missing

</details>

<details>
<summary>Get user tokens</summary>

- [x] returns 200 if valid auth
- [x] returns logged in users tokens if no id is passed
- [x] returns logged in users tokens if id is passed
- [x] returns 400 if invalid id
- [x] returns 403 if a user tries to get another users tokens
- [x] returns 200 if a admin tries to get other users tokens

</details>

#### Token expiration - TODO

- [] returns 403 when refresh token is 30days old
- [] refreshes token if expiered and refresh token is valid

<p align="right">(<a href="#top">back to top</a>)</p>

## Docs, secruity and deploy

#### logging

- [] should i add? - to think about it

#### Create Docs

- [] [Docgen Library] (https://github.com/thedevsaddam/docgen)
- [] Export Postman Collection
- [] docgen build -i fileName.json -o index.html
- [] create index.html in public

#### Security Packages

- [] express-rate-limiter - is this needed?
- [x] helmet
- [x] xss-clean
- [x] cors (cookies!!!!)

#### Deploy on Heroku

- [x] heroku account and heroku cli
- [x] add dev command "nodemon app.js"
- [x] change start to "node app.js"
- [x] setup node version in package.json
- [x] git commit latest changes
- [x] heroku login
- [x] heroku create "App Name"
- [x] setup env vars in heroku
- [x] git push heroku

<p align="right">(<a href="#top">back to top</a>)</p>
