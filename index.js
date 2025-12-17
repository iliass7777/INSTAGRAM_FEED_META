require('dotenv').config();
const express = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const app = express();

/* CORS Management */
app.use(cors({
    origin: '*'
}));

const upload = multer();
app.use(upload.array());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

/* Servir les fichiers statiques (page HTML) */
app.use(express.static(path.join(__dirname, 'clients')));

/* API Routes - Instagram Graph API */
require('./routes/reporting.routes')(app , 'api/v1');

/* Default Route (Home) - Servir la page HTML */
app.get("/", (req , res) => {
    res.sendFile(path.join(__dirname, 'clients', 'index.html'));
});

/* Route pour les embeds permanents */
app.get("/embed/:id", (req , res) => {
    res.sendFile(path.join(__dirname, 'clients', 'embed.html'));
});

/* Route admin */
app.get("/admin", (req , res) => {
    res.sendFile(path.join(__dirname, 'clients', 'admin', 'index.html'));
});
app.get("/admin/", (req , res) => {
    res.sendFile(path.join(__dirname, 'clients', 'admin', 'index.html'));
});

app.get("/api", (req , res) => {
    res.status(200);
    res.send("META API - Instagram Feed Backend");
});

/* Health Check */
app.get("/health", (req , res) => {
    res.status(200).json({
        status: "OK",
        message: "Server is running",
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;