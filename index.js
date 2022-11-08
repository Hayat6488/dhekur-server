const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();


//middle wares
app.use(cors());
app.use(express.json());

//mongodb conncetion
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.djdi1bf.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const foodsCollection = client.db('dhekur').collection('foods');

        app.get('/foods', async (req, res) => {
            const query = {};
            const cursor = foodsCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        })
    }
    finally {

    }
}

run().catch(err => console.error(err));


app.get('/', (req, res) => {
    res.send('Dhekur server running');
})

app.listen(port, () => {
    console.log(`Dhekur server is running on port: ${port}`);
})