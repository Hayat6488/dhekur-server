const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();


//middle wares
app.use(cors());
app.use(express.json());

//mongodb conncetion
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.djdi1bf.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const foodsCollection = client.db('dhekur').collection('foods');
        const reviewsCollection = client.db('dhekur').collection('reviews');

        app.get('/food', async (req, res) => {
            const query = {};
            const cursor = foodsCollection.find(query);
            const services = await cursor.limit(3).toArray();
            res.send(services);
        });

        app.get('/foods', async (req, res) => {
            const query = {};
            const cursor = foodsCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });

        app.get('/foods/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const food = await foodsCollection.findOne(query);
            res.send(food);
        });

        //reviews api

        app.post('/reviews', async(req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.send(result);
        } );

        app.get('/reviews', async(req, res) => {
            let query = {};
            if(req.query.serviceId){
                query = {
                    serviceId: req.query.serviceId
                }
            }
            const cursor = reviewsCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews)
        });

        app.get('/myreviews', async(req, res) => {
            let query = {};
            if(req.query.uid){
                query = {
                    uid: req.query.uid
                }
            }
            const cursor = reviewsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

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