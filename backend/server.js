const express = require("express")
const app = express()
const cors = require("cors")
app.use(cors())

const kelas = require("./router/kelas")
const petugas = require("./router/petugas")
const spp = require("./router/spp")
const siswa = require("./router/siswa")
const pembayaran = require("./router/pembayaran")
app.use("/spp/kelas", kelas)
app.use("/spp/petugas", petugas)
app.use("/spp/pembayaran", pembayaran)
app.use("/spp/siswa", siswa)
app.use("/spp/spp", spp)

app.listen(8000, () => {
  console.log("Server on 8000");
})