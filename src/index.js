const app = require('./app')

const port = process.env.PORT || 9090
app.listen(port)
console.log(`Listening on port ${port}`)
