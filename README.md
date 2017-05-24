# auth-jwt-express-server

## What is this?

This is a Node, Express, and Mongoose API that implements token based authentication.

There is an (as yet unfinished) example React app using this at https://github.com/JohnTasto/auth-jwt-react-client.

## How does it work?

There are various endpoints that allow users to sign up, sign in, sign out, verify their email, and change their password. Depending on the endpoint, it requires either an email and password, or a token previously sent by the server. On a valid request, it sends back either an access token and a refresh token, or sends the user an email with a link with an embedded JWT token.

### What is a refresh token?

Once a user is authenticated, the server sends back two tokens: an access token and a refresh token. The access token should be used for most subsequent authenticated API requests, but it only works for 15 minutes. Once it expires, the refresh token can be used to obtain a new access token. This allows some requests to be made without hitting the database unnecessarily, but has the side effect that if you manually delete a user's refresh token from the database (effectively signing them out), it could take up to 15 minutes to take effect. The frontend app should be written so this all happens without the user's knowledge. To learn more about refresh tokens, check out https://auth0.com/learn/refresh-tokens/.

### Email links

The way this is currently written, it requires a seperate frontend app to parse the link using a frontend router, then send the embedded token to the API server in the header. It could have been written so links go directly back to this API server, but then it would have to send some sort of response back to the user, such as rendering some HTML and sending it back.

## Endpoints

All tokens are expected this header: `authorization: Bearer {token}`

Emails and passwords are expected in the body as JSON using the keys listed below.

All responses are JSON using the keys `time`, `accessToken`, and `refreshToken`. `time` is in unix format, and provided so the client can sync its clock with the server and preemptively request a new access token before it expires.

method | URL             | auth token     | request body                 | response              | email          | status codes
------ | --------------- | -------------- | ---------------------------- | --------------------- | -------------- | -------------
post   | /signup         |                | email, password              |                       | verification   | 201, 422
patch  | /signin         |                | email, password              | time, access, refresh |                | 200, 401, 422
patch  | /signout        | refresh        |                              |                       |                | 200, 401
patch  | /verifyemail    | verify email   |                              | time, access, refresh |                | 200, 401
get    | /refresh        | refresh        |                              | time, access          |                | 200, 401
patch  | /changepassword |                | email, password, newPassword | time, access, refresh |                | 200, 401, 422
get    | /resetpassword  |                | email                        |                       | reset password | 200, 401
patch  | /resetpassword  | reset password | password                     |                       |                | 200, 401, 422
get    | /feature        | access         | *anything you want!*         | *actual data!*        |                | 200, *??*

## Authentication flow

This diagram is outdated (will be updated soon), but it give more details on what is actually stored in the database.

![Authentication flow diagram](https://cdn.rawgit.com/JohnTasto/auth-jwt-express-server/f95df89f1454a188789823aaf46aacbd00bd265a/docs/auth-flows.svg "Authentication flow diagram")

All database operations are single calls (i.e., `.findOneAndUpdate()`), so theoretically multiple server instances can run and hit the same database without any race conditions.

## Vulnerabilities

While tokens are generally safe to store in a native app, it is probably unwise to store them using JavaScript in localStorage. I imagine it is safe as long as any user generated content is sanitized before it is displayed (to prevent XSS attacks), but I am no security expert.

## Todo

- [ ] Upgrade to Jest 20
- [ ] Add CI
- [ ] Host publicly
- [ ] Refactor to sub-app

## License

MIT

Copyright (c) 2017-present, John Tasto. All rights reserved.

Feel free to use this in your own projects, but I am not responsible for any data loss or any other problems that may arise. Use at your own risk.
