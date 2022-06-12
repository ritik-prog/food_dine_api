const express = require('express')
const dotenv = require('dotenv')
const colors = require('colors')
const morgan = require('morgan')
const connectDB = require('./config/db')
const cors = require('cors')

const menuItemRouter = require('./routes/menuItems')
const userAuthRouter = require('./routes/userAuth')
const restaurantsRouter = require('./routes/restaurants')
const tablesRouter = require('./routes/tables')
const userRouter = require('./routes/users')
const restaurantAuthRouter = require('./routes/restaurantAuth')
const orderRouter = require('./routes/orders')

dotenv.config({path: './config/config.env'})

connectDB()

const app = express()

app.use(express.json())
app.use(cors())

app.use('/api/v1/restaurants', restaurantsRouter)
app.use('/api/v1/restaurantsauth', restaurantAuthRouter)
app.use('/api/v1/menuitems', menuItemRouter)
app.use('/api/v1/tables', tablesRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/auth/', userAuthRouter)
app.use('/api/v1/orders/', orderRouter)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`Listening to server on port: ${PORT}`.green)
})
