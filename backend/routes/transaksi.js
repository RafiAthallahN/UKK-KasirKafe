const express = require("express");
const app = express()
const Sequelize = require("sequelize");
const Op = Sequelize.Op
const { auth, isKasir, isManajer } = require("../auth")

const models = require("../models");
const transaksi = models.transaksi;
const detail_transaksi = models.detail_transaksi;
const meja = models.meja
const menu = models.menu
const user = models.user;

app.use(express.json());

app.get("/", auth, isManajer, async (req, res) => {
    let result = await transaksi.findAll({
        include: [
            "user",
            "meja",
            {
                model: models.detail_transaksi,
                as: "detail_transaksi",
                include: ["menu"]
            }
        ],
        order: [['createdAt', 'DESC']]
    })
    res.json({
        count: result.length,
        transaksi: result
    })
})

app.get("/:id", async (req, res) => {
    const param = { id_transaksi: req.params.id };
    try {
        const result = await transaksi.findOne({ where: param });
        res.json({ data: result });
    } catch (err) {
        res.json({ msg: err.message });
    }
});

app.get("/id/:id_transaksi", auth, isKasir, async (req, res) => {
    const param = { id_transaksi: req.params.id_transaksi };
    try {
        const result = await transaksi.findAll({
            where: param,
            include: ["user", "meja", { model: detail_transaksi, as: "detail_transaksi", include: ["menu"] }],
        });
        const sumTotal = await transaksi.sum("total", { where: param });
        res.json({ transaksibyid_transaksi: result, sumTotal: sumTotal });
    } catch (err) {
        res.json({ msg: err.message });
    }
});

// app.post("/byUser/:nama_user", auth, isManajer, async (req, res) => {
//     const param = { nama_user: req.params.nama_user };
//     try {
//         const result = await transaksi.findAll({
//             where: param,
//             include: ["user", "meja", { model: detail_transaksi, as: "detail_transaksi", include: ["menu"] }],
//             order: [["createdAt", "DESC"]],
//         });
//         const sumTotal = await transaksi.sum("total", { where: param });
//         res.json({ count: result.length, transaksibyid_user: result, sumTotal: sumTotal });
//     } catch (err) {
//         res.json({ msg: err.message });
//     }
// });

//tambah transaksi 2
app.post("/tambah", auth,  async (req, res) => {
    let current = new Date().toISOString().split('T')[0]
    let data = {
        tgl_transaksi: current,//current : 
        id_user: req.body.id_user,//siapa customer yang beli
        id_meja: req.body.id_meja,
        nama_pelanggan: req.body.nama_pelanggan,
        status: "belum_bayar",
        total: 0 // inisialisasi nilai total awal
    }
    let param = { id_meja: req.body.id_meja }

    // Periksa apakah meja tersedia atau tidak
    let mejaData = await meja.findOne({
        where: { id_meja: req.body.id_meja, status: "Available" },
    });
    if (!mejaData) {
        return res.json({
            message: "Meja tidak tersedia",
        });
    }

    // Periksa apakah meja masih digunakan atau tidak
    let transaksiData = await transaksi.findOne({
        where: { id_meja: req.body.id_meja, status: "Available" },
    });
    if (transaksiData) {
        return res.json({
            message: "Meja masih digunakan",
        });
    }

    let upMeja = {
        available: "no"
    }
    await meja.update(upMeja, ({ where: param }))
    transaksi.create(data)
        .then(async result => {
            let lastID = result.id_transaksi
            console.log(lastID)
            detail = req.body.detail_transaksi

            //tambah loop foreach da
            let total = 0 
            for (let i = 0; i < detail.length; i++) {
                const element = detail[i];
                const dataMenu = await menu.findByPk(element.id_menu);
                let harga = dataMenu.harga;
                let subtotal = element.qty * harga;
                total += subtotal;
    
                await detail_transaksi.create({
                    id_transaksi: lastID,
                    id_menu: element.id_menu,
                    qty: element.qty,
                    harga: harga,
                    subtotal: subtotal,
                });
            }
            transaksi
            .update({ total: total }, { where: { id_transaksi: lastID } })
            .then((result) => {
                res.json({
                    message: "Data has been inserted",
                });
            })
            .catch((error) => {
                res.json({
                    message: error.message,
                });
            });
    })
        .catch(error => {
            console.log(error.message);
        })
})

//update menu plus update total
app.post("/updateDetailTotal", async (req, res) => {
    try {
        const { id_transaksi, detail_transaksi } = req.body;

        let transaksiData = await transaksi.findByPk(id_transaksi);
        if (!transaksiData) {
            return res.json({
                message: "Data transaksi not found",
            });
        }

        // Update total pada data transaksi
        let oldTotal = transaksiData.total;
        let newTotal = oldTotal;
        for (let i = 0; i < detail_transaksi.length; i++) {
            const { id_menu, qty } = detail_transaksi[i];
            let menuData = await menu.findByPk(id_menu);

            if (!menuData) {
                return res.json({
                    message: "Menu not found",
                });
            }

            // Update detail transaksi
            let harga = menuData.harga;
            let subtotal = harga * qty;
            await models.detail_transaksi.create({
                id_transaksi,
                id_menu,
                harga,
                qty,
                subtotal,
            });

            newTotal += subtotal;
        }

        transaksiData.total = newTotal;
        await transaksiData.save();

        res.json({
            message: "Data total has been updated",
        });
    } catch (error) {
        res.json({
            message: error.message,
        });
    }
});


app.post("/add", auth, isKasir, async (req, res) => {
    const current = new Date().toISOString().split("T")[0];
    const data = {
        tgl_transaksi: current,
        id_user: req.body.id_user,
        id_meja: req.body.id_meja,
        nama_pelanggan: req.body.nama_pelanggan,
        status: "belum_bayar",
        total: req.body.total
    };
    try {
        const result = await transaksi.create(data);
        const lastID = result.id_transaksi;
        const detail = req.body.detail_transaksi.map((item) => ({ ...item, id_transaksi: lastID }));
        await detail_transaksi.bulkCreate(detail);
        res.json({ message: "Data has been inserted" });
    } catch (err) {
        console.log(err.message);
        res.json({ message: err.message });
    }
});

app.put("/update/:id", auth, isKasir, async (req, res) => {
    const param = { id_transaksi: req.params.id };
    const data = { status: req.body.status };
    try {
        await transaksi.update(data, { where: param });
        res.json({ message: "Data has been updated" });
    } catch (err) {
        res.json({ message: err.message });
    }
});

app.delete("/delete/:id_transaksi", async (req, res) => {
    let param = { id_transaksi: req.params.id_transaksi }
    try {
        await detail_transaksi.destroy({ where: param })//menghapus detail dulu atau anak 
        await transaksi.destroy({ where: param })//baru selanjutnya hapus yang parent kalau insert sebaliknya
        res.json({
            message: "data has been deleted"
        })
    } catch (error) {
        res.json({
            message: error
        })


    }
})

// Search transaksi by nama user
app.get("/search/:keyword", auth, isManajer, async (req, res) => {
    let keyword = req.params.keyword
    let result = await transaksi.findAll({
        where: {
            [Op.or]: [
                {
                    id_transaksi: {
                        [Op.like]: `%${keyword}%`
                    }
                },
                {
                    total: {
                        [Op.like]: `%${keyword}%`
                    }
                },
                {
                    nama_pelanggan: {
                        [Op.like]: `%${keyword}%`
                    }
                },
                {
                    '$user.nama_user$': {
                        [Op.like]: `%${keyword}%`
                    }
                }
            ]
        },
        include: [
            "user",
            "meja",
            {
                model: models.detail_transaksi,
                as: "detail_transaksi",
                include: ["menu"]
            }
        ],
        order: [['id_transaksi', 'DESC']]
    })
    let sumTotal = await transaksi.sum("total", {
        where: {
            [Op.or]: [
                {
                    id_transaksi: {
                        [Op.like]: `%${keyword}%`
                    }
                },
                {
                    total: {
                        [Op.like]: `%${keyword}%`
                    }
                },
                {
                    nama_pelanggan: {
                        [Op.like]: `%${keyword}%`
                    }
                },
                {
                    '$user.nama_user$': {
                        [Op.like]: `%${keyword}%`
                    }
                }
            ]
        },
        include: [
            "user"
        ],
        order: [['id_transaksi', 'DESC']]
    });
    res.json({
        count: result.length,
        transaksi: result,
        sumTotal: sumTotal
    })
})

//get data transaksi by date
app.get("/date", auth, isManajer, async (req, res) => {
    let start = new Date(req.params.start)
    let end = new Date(req.params.end)

    let result = await transaksi.findAll({
        where: {
            tgl_transaksi: {
                [Op.between]: [
                    start, end
                ]
            }
        },
        include: [
            "user",
            "meja",
            {
                model: models.detail_transaksi,
                as: "detail_transaksi",
                include: ["menu"]
            }
        ],
        order: [['createdAt', 'DESC']],

    })
    let sumTotal = await transaksi.sum("total", {
        where: {
            tgl_transaksi: {
                [Op.between]: [
                    start, end
                ]
            }
        }
    });
    res.json({
        count: result.length,
        transaksi: result,
        sumTotal: sumTotal
    })
})


module.exports = app;