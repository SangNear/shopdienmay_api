const jwt = require("jsonwebtoken")

const generateToken = (user) => {
    return new Promise((resolve, reject) => {
        const payload = {
            user: {
                id: user._id,
                role: user.role
            }
        }
        jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "40h"}, (err, token) => {
            if(err) reject(err)
                resolve(token)
        })
    })
}

module.exports = generateToken