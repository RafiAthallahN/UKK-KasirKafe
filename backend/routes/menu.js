const express = require("express")
const menu = require("../models/index").menu
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./image/menu")
    },
    filename: (req, file, cb) => {
        cb(null, "menu-" + Date.now() + path.extname(file.originalname))
    }
})
let upload = multer({ storage: storage })

app.get("/", async (req, res) => {
    menu.findAll()
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
        id_menu: req.params.id
    }
    menu.findOne({ where: param })
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

app.post("/", upload.single("image"), async (req, res) => {
    if (!req.file) {
        res.json({
            message: "No Uploaded File"
        })
    } else {
        let data = {
            nama_menu: req.body.nama_menu,
            jenis: req.body.jenis,
            deskripsi: req.body.deskripsi,
            image: req.file.filename,
            price: req.body.price,
            stock: req.body.stock
        }
        menu.create(data)
            .then(result => {
                res.json({
                    message: "Data has been inserted"
                })
            })
            .catch(error => {
                res.json({
                    message: error.message
                })
            })
    }
})

app.put("/:id", upload.single("image"), (req, res) => {
    let param = { id_menu: req.params.id }
    let data = {
        nama_menu: req.body.nama_menu,
        jenis: req.body.jenis,
        deskripsi: req.body.deskripsi,
        price: req.body.price,
        stock: req.body.stock
    }
    if (req.file) {
        const row = menu.findOne({ where: param })
            .then(result => {
                let oldFileName = result.image

                //delete old file
                let dir = path.join(__dirname, "../image/menu", oldFileName)
                fs.unlink(dir, err => console.log(err))
            })
            .catch(error => {
                console.log(error.message);

            })
        data.image = req.file.filename
    }

    menu.update(data, { where: param })
        .then(result => {
            res.json({
                message: "Data has been Updated"
            })
        })
        .catch(error => {
            res.json({
                message: error.message
            })
        })
})


app.delete("/:id", async (req, res) => {
    try {
        let param = { id_menu: req.params.id }
        let result = await menu.findOne({ where: param })
        let oldFileName = result.image

        //delete oldfile
        let dir = path.join(__dirname, "../image/menu", oldFileName)
        fs.unlink(dir, err => console.log(err))

        //delete data
        menu.destroy({ where: param })
            .then(result => {
                res.json({
                    message: "Data has been deleted",
                })
            })
            .catch(error => {
                res.json({
                    message: error.message
                })
            })
    }
    catch (error) {
        res.json({
            message: error.message
        })
    }
})

module.exports = app