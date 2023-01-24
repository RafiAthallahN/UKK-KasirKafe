const express = require("express")
const user = require("../models/index").user
const md5 = require("md5")
const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.get("/", async (req, res) => {
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

app.get("/:id", async (req, res) => {
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

app.post("/", async (req, res) => {
    let data = {
        nama_user: req.body.nama_user,
        role: req.body.role,
        username: req.body.username,
        password: md5(req.body.password)
    }
    petugas.create(data)
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

app.put("/", async (req, res) => {
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

app.delete("/:id", async (req, res) => {
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

module.exports = app