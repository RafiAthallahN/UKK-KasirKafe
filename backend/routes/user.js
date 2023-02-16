const express = require("express")
const user = require("../models/index").user
const md5 = require("md5")
const jwt = require("jsonwebtoken")
const sequelize = require("sequelize")
const SECRET_KEY = "INIKASIR"
const auth = require("../auth")
const Op = sequelize.Op
const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.get("/", auth, async (req, res) => {
    user.findAll()
        .then(result => {
            res.json({
                data: result
            })
        })
        .catch(error => {
            res.json({
                message: error.message
            })
        })
})

app.get("/:id", auth, async (req, res) => {
    let param = {
        id_user: req.params.id
    }
    user.findOne({ where: param })
        .then(result => {
            res.json({
                data: result
            })
        })
        .catch(error => {
            res.json({
                message: error.message
            })
        })
})

app.post("/", auth, async (req, res) => {
    let data = {
        nama_user: req.body.nama_user,
        role: req.body.role,
        username: req.body.username,
        password: md5(req.body.password)
    }
    user.create(data)
        .then(result => {
            res.json({
                message: "Data Added",
                data: result
            })
        })
        .catch(error => {
            res.json({
                message: error.message
            })
        })
})

app.put("/", auth, async (req, res) => {
    let param = {
        id_user: req.body.id_user
    }
    let data = {
        nama_user: req.body.nama_user,
        role: req.body.role,
        username: req.body.username,
        password: md5(req.body.password)
    }
    user.update(data, { where: param })
        .then(result => {
            res.json({
                message: "Data Updated",
                data: result
            })
        })
        .catch(error => {
            res.json({
                message: error.message
            })
        })
})

app.delete("/:id", auth, async (req, res) => {
    let param = {
        id_user: req.params.id
    }
    user.destroy({ where: param })
        .then(result => {
            res.json({
                message: "Data Deleted"
            })
        })
        .catch(error => {
            res.json({
                message: error.message
            })
        })
})

app.post("/search/:keyword", auth, async (req, res) => {
    let keyword = req.params.keyword
    let result = await user.findAll({

        where: {
            [Op.or]: [
                {
                    id_user: {
                        [Op.substring]: `%${keyword}%`
                    }
                },
                {
                    username: {
                        [Op.substring]: `%${keyword}%`
                    }
                },
                {
                    role: {
                        [Op.substring]: `%${keyword}%`
                    }
                }
            ]
        }
    })
    res.json({
        user: result
    })

})

app.post("/login", async (req, res) => {
    let param = {
        username: req.body.username,
        password: md5(req.body.password),
    }
    let result = await user.findOne({ where: param })
    if (result) {
        let payload = JSON.stringify(result)
        let token = jwt.sign(payload, SECRET_KEY)
        res.json({
            logged: true,
            data: result,
            token: token
        })
    } else {
        res.json({
            logged: false,
            message: "Username atau Password salah"
        })
    }
})

module.exports = app