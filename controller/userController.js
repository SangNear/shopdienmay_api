const User = require('../models/User')
const generateToken = require('../utils/generateToken')

const login = async (req,res) => {
    const { username, password } = req.body

    try {
        let user = await User.findOne({ username })
        if (!user) return res.status(401).json({ message: "Tài khoản không hợp lệ" })

        const isMacth = await user.macthPassword(password)

        if (!isMacth) return res.status(401).json({ message: "Tài khoản không hợp lệ" })

        const token = await generateToken(user)

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            samesite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })

        res.status(201).json({
            user: {
                _id: user._id,
                username: user.username,
                role: user.role
            },
        })

    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error")
    }
}

const register = async (req, res) => {
    const { username, password, role } = req.body
    try {
        let user = await User.findOne({ username })
        if (user) return res.status(403).json({ message: "Username is exists!" })

        user = new User({
            username, password, role
        })
        await user.save()

        const token = await generateToken(user)

        res.status(201).json({
            user: {
                _id: user._id,
                username: user.username,
                role: user.role
            },
            token
        })

    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error")
    }
}

module.exports = { login,register }