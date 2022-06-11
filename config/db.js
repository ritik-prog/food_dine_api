const mongoose = require('mongoose')
const colors = require('colors')

const connectDB = async () => {
    await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(() => {
        console.log('Database Connection Established'.green.inverse)
    }).catch(err => {
        console.log('Database Connection Failed'.red.inverse)
        console.log(`ERROR: ${err.message}`.red)
    })
}

module.exports = connectDB