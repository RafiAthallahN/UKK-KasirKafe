const express = require("express")
const cors = require("cors")
const app = express()
app.use(cors())

const user = require("./routes/user")
const meja = require("./routes/meja")
const menu = require("./routes/menu")
const transaksi = require("./routes/transaksi")

app.use("/kafe/user", user)
app.use("/kafe/meja", meja)
app.use("/kafe/menu", menu)
app.use("/kafe/transaksi", transaksi)


app.listen(8080, () => {
  console.log("Server on 8080");
})