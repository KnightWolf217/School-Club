let express = require('express');
let app = express();
let fs = require('fs');
let mongoClient = require('mongodb').MongoClient;
let dbUrl = "mongodb+srv://user:PassWord123@cluster0.rwdav.mongodb.net/school?retryWrites=true&w=majority";
let cors = require('cors')
app.use(cors())
let bodyParser = require('body-parser');
app.use(bodyParser.json());
let port = process.env.PORT || 8080

let db;
mongoClient.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
    db = client.db('school')
})

//static files 
let pathImages = './images'
if (fs.existsSync(pathImages)) {
    app.use('/images', express.static('images'));
} else {
    console.log("Images not found")
}
let path = './checkout.html'
if (fs.existsSync(path)) {
    app.use('/checkout.html', express.static('checkout.html'));
} else {
    console.log("Checkout page not found")
}
let mainFile = './index.html'
if (fs.existsSync(mainFile)) {
    app.use('/index.html', express.static('index.html'));
} else {
    console.log("Index.html not found")
}

//listening on port
app.listen(port, (req, res) => {
    console.log("Server running on port " + port)
});

//get requests
app.get('/', (req, res) => {
    res.send('Select a collection, e.g., /collection/lessons')
})

app.param('collectionName', (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName)
    return next()
})

//get lessons
app.get('/collection/:collectionName', (req, res, next) => {
    req.collection.find({}, {
        sort: [
            ['id', 1]
        ]
    }).toArray((e, results) => {
        if (e) return next(e);
        res.send(results);
        console.log("Lesson details given");
    })
})

//create order
app.post('/collection/:collectionName', (req, res, next) => {
    req.collection.insertOne(req.body, (e, results) => {
        if (e) return next(e)
        res.send(results.ops)
    })
    console.log("Order submitted!")
})

//retrieve object by mongodb ID
const ObjectID = require('mongodb').ObjectID;
app.get('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.findOne({ _id: newObjectID(req.params.id) },
        (e, result) => {
            if (e) returnnext(e)
            res.send(result)
        })
})

//update number of spaces
app.put('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.updateOne({ _id: new ObjectID(req.params.id) }, { $set: req.body }, { safe: true, multi: false },
        (e, result) => {
            if (e) return next(e)
            res.send((result.result.n === 1) ? { msg: 'success' } : { msg: 'error' })
        })
    console.log("Lesson available spaces updated!")
})
 
