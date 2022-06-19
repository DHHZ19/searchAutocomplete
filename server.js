const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const {MongoClient, ObjectId} = require('mongodb')

const PORT = 8000

let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'sample_mflix',
    collection

//connect
MongoClient.connect(dbConnectionStr)
.then(client =>{
    console.log(`Conntect to db ${dbName}`)
    db = client.db(dbName)
    collection = db.collection('movies')
})
//add middleware
app.use(express.urlencoded({extended : true}))
app.use(express.json())
app.use(cors())

// API code 


app.get('/search', async (req,res) =>{
    try{
        let result = await collection.aggregate(
            [  {
                 '$Search':{
                    'autocomplete' : {
                        'query': `${req.query.query}`,
                        'path' : 'title',
                        'fuzzy': {
                            'maxEdits' : 2,
                            'prefixLength': 3
                        }
                    }
                 }
               }
            ]
        ).toArray()
        res.send(result)
    }catch(error){
        res.status(500).send({message: error.message})
    }
})


app.get('/get/:id', async (req, res) => {
    try{
        let result = await collection.findOne({
            '_id' : ObjectId(req.params.id)
        })
        res.send(result)
    }catch(error){
        res.status(500).send({message: error.message})
    }
})



app.listen(process.env.PORT || PORT, () => {
    console.log(`Connected to server ${PORT} betta go catch it`)
})