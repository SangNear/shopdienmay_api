const express = require("express")
const { default: mongoose } = require("mongoose")
const app = express()
const bodyParser = require("body-parser")
const dotenv = require('dotenv')
const cors = require('cors')
const productRoute = require('./routes/product')
const categoryRoute = require('./routes/category')
const orderRoute = require('./routes/order')
const path = require('path');


dotenv.config()
app.use(express.json())
app.use(bodyParser.json())
app.use(cors())


app.use(express.json({ limit: '10mb' })); // Increase limit as needed
app.use(express.urlencoded({ limit: '10mb', extended: true })); // For URL-encoded bodies

mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log("DB Connection Successfully!");
    })
    .catch((error) => {
        console.log(error);
    })


app.use('/api/v1/product', productRoute)
app.use('/api/v1/category', categoryRoute)
app.use('/api/v1/order', orderRoute)
app.use('/images', express.static(path.join(__dirname, 'images')));
app.listen(1999, () => {
    console.log("Server is running on http://localhost:1999");
})
