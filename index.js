const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());


// database connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hagxk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const inventoryCollection = client.db('Inventory').collection('inventoryItems');

        // load all inventory items
        app.get('/items', async (req, res) => {
            const query = {};
            const cursor = inventoryCollection.find(query);
            const inventoryItems = await cursor.toArray();
            res.send(inventoryItems);
        });

        // load single item using _id
        app.get('/items/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const singleItem = await inventoryCollection.findOne(query);
            res.send(singleItem);
        })

        // update quantity when delivered button is clicked
        app.put('/items/:id', async (req, res) => {
            const id = req.params.id;
            const updatedQuantity = req.body;
            console.log(updatedQuantity);
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    quantity: updatedQuantity.quantity
                },
            };
            const result = await inventoryCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })

        // delete any item from inventory
        app.delete('/items/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await inventoryCollection.deleteOne(query);
            res.send(result);
        })

        // add item to inventory
        app.post('/items', async (req, res) => {
            const newItem = req.body;
            console.log('new item', newItem);
            const result = await inventoryCollection.insertOne(newItem);
            res.send(result);
        })

        // load items by user email
        app.get('/myitems', async (req, res) => {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return res.status(401).send({ message: "unauthorized access!" });
            }
            const email = req.query.email;
            const query = { email: email };
            // console.log('query get func', query);
            const cursor = inventoryCollection.find(query);
            const inventoryItems = await cursor.toArray();
            res.send(inventoryItems);
        })

        // delete my item by user email
        app.delete('/myitems', async (req, res) => {
            // console.log('delete');
            const email = req.query.email;
            // console.log('email', email);
            const query = { email: email };
            console.log('query', query);
            const result = await inventoryCollection.deleteOne(query);
            res.send(result);
        })

        // JWT auth
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.SECRET_ACCESS_TOKEN, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
        })

    }
    finally {
        console.log('dont know what to do in here.');
    }
}
run().catch(console.dir);

app.get('/app', (req, res) => {
    res.send("app is running");
})


app.get('/', (req, res) => {
    res.send("Server side is OK!");
});

app.listen(port, () => {
    console.log("Listening to Port", port);
});