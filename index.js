const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();


//middle wares
app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.send('Dhekur server running');
})

app.listen(port, () => {
    console.log(`Dhekur server is running on port: ${port}`);
})