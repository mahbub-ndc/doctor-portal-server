const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config()

//middleware

app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {

  res.send('node js is running');
})

app.listen(port, () => {
  console.log(`car doctor server is running on port: ${port}`);
})

//console.log(process.env.SECRET_KEY);

const uri = `mongodb+srv://${process.env.S3_BUCKET}:${process.env.SECRET_KEY}@cluster0.khsbip8.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const serviceCollection = client.db('carDoctor').collection('monira');
    const bookingCollection = client.db('carDoctor').collection('bookings')

    app.get('/monira', async (req, res) => {
      const cursor = serviceCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/monira/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: (id) };
      const options = {
        projection: { title: 1, price: 1, service_id: 1, img: 1 },
      }
      const result = await serviceCollection.findOne(query, options);
      res.send(result);
    })

    app.get('/bookings', async (req, res) => {
      console.log(req.query);
      let query ={};
      if(req.query?.email){
      query = {email: req.query.email};
      }
      const result = await bookingCollection.find(query).toArray();
      res.send(result);
    })

    app.post('/bookings', async (req, res) => {
      const booking = req.body;
      console.log(booking);
      const result = await bookingCollection.insertOne(booking);
      res.send(booking);
    })

    app.delete('/bookings/:id', async(req, res)=>{
      const id = req.params.id;
      const query ={_id: new ObjectId(id)};
      const result = await bookingCollection.deleteOne(query);
      res.send(result);

    })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);
