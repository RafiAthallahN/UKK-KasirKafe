const express = require("express")
const detail_transaksi = require("../models/index").detail_transaksi
const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.get("/", async (req, res) => {
    detail_transaksi.findAll()
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
        id_detail_transaksi: req.params.id
    }
    detail_transaksi.findOne({ where: param })
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
      id_transaksi: req.body.id_transaksi,
      id_menu: req.body.id_menu,
      harga: req.body.harga
    }
    id_detail_transaksi.create(data)
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
        id_detail_transaksi: req.body.id_detail_transaksi
    }
    let data = {
        id_transaksi: req.body.id_transaksi,
        id_menu: req.body.id_menu,
        harga: req.body.harga
    }
    detail_transaksi.update(data, { where: param })
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
        id_detail_transaksi: req.params.id
    }
    detail_transaksi.destroy({ where: param })
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