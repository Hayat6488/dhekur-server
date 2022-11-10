const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');


//middle wares
app.use(cors());
app.use(express.json());

//mongodb conncetion
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.djdi1bf.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
        res.status(401).send({message: 'unauthorized access'})
    }
    {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(error, decoded){
            if(error){
                res.status(401).send({message: 'unauthorized access'})
            }
            req.decoded = decoded;
            next();
        })
    }
}

async function run() {
    try {
        const foodsCollection = client.db('dhekur').collection('foods');
        const reviewsCollection = client.db('dhekur').collection('reviews');

        // foods api

        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1d'})
            res.send({token});
        })

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

        app.post('/foods', async(req, res) => {
            const food = req.body;
            const result = await foodsCollection.insertOne(food);
            res.send(result);
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
            const cursor = reviewsCollection.find(query).sort({date: -1, time: -1});
            const reviews = await cursor.toArray();
            res.send(reviews)
        });

        app.get('/myreviews', verifyJWT, async(req, res) => {
            const decoded = req.decoded;
            if(decoded.uid !== req.query.uid){
                res.status(403).send({message: 'unauthorized access'})
            }

            let query = {};
            if(req.query.uid){
                query = {
                    uid: req.query.uid
                }
            }
            const cursor = reviewsCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        app.delete('/myreviews/:id', async(req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id)};
            const result = await reviewsCollection.deleteOne(query);
            res.send(result);
        });

        app.put('/myreviews/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const options = {upsert: true};
            const updateData = req.body;
            const updatedData = {
                $set: {
                    ratings: updateData.ratings,
                    comment: updateData.comment
                }
            }
            const result = await reviewsCollection.updateOne(query, updatedData, options);
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