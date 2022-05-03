const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config()

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

    }
    finally {
        console.log('dont know what to do in here.');
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send("Server side is OK!");
});

app.listen(port, () => {
    console.log("Listening to Port", port);
});