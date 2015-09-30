user center middleware

Usage:

```javascript
var UserCenter = require("./usercenter")
app.use('/usercenter', UserCenter({app:app}));
```

or used as standalone server:

`$ npm start`

## Todos

- [] Add role/createAt/modifyAt to user info
- [] API for app that uses this middleware
- [] Add admin entrance feature
    - at first view of login, if no admin role found then should be a view to initialize
- [] Add admin dashboard for user management
- [] Add admin dashboard for user trend(Chart.js) and logins
- [] OAuth api for other apps
