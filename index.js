const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//middleswares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.oahoku5.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const productCollection = client.db("ShoppingFreak").collection("Products");

    app.get("/products", async (req, res) => {
      const query = req.query;
      const page = parseInt(query.page || 0);
      const limit = parseInt(query.limit || 10);
      const skip = page * limit;
      const result = await productCollection
        .find()
        .skip(skip)
        .limit(limit)
        .toArray();
      res.send(result);
    });

    app.post("/productsByIds", async (req, res) => {
      const ids = req.body;
      const objectIds = ids.map((id) => new ObjectId(id));
      const query = { _id: { $in: objectIds } };
      const result = await productCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/totalProducts", async (req, res) => {
      const result = await productCollection.estimatedDocumentCount();
      res.send({ totalProducts: result });
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Shopping Freak is running");
});

app.listen(port, () => {
  console.log(`Shooping Freak is running on port: ${port}`);
});
