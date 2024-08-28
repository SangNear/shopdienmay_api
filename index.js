const express = require("express")
const { default: mongoose } = require("mongoose")
const app = express()
const bodyParser = require("body-parser")
const dotenv = require('dotenv')
const cors = require('cors')
const productRoute = require('./routes/product')




dotenv.config()
app.use(express.json())
app.use(bodyParser.json())
app.use(cors())




mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log("DB Connection Successfully!");
    })
    .catch((error) => {
        console.log(error);
    })


app.use('/api/v1/product', productRoute)

app.listen(1999, () => {
    console.log("Server is running on http://localhost:1999");
})
