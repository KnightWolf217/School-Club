let express = require('express');
let app = express();
let mongoClient = require('mongodb').MongoClient;
let dbUrl = "mongodb+srv://user:PassWord123@cluster0.rwdav.mongodb.net/school?retryWrites=true&w=majority";
let cors = require('cors')
app.use(cors())
let bodyParser = require('body-parser');
app.use(bodyParser.json());

let db;
mongoClient.connect(dbUrl, (err, client) => {
    db = client.db('school')
})

//static files
app.use('/images', express.static('images'));

//listening on port 8080
app.listen(8080);

//get requests
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
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
    })
})

//create order
app.post('/collection/:collectionName', (req, res, next) => {
    req.collection.insert(req.body, (e, results) => {
        if (e) return next(e)
        res.send(results.ops)
    })
})

//update number of spaces
app.put('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.update({ _id: new ObjectID(req.params.id) }, { $set: req.body }, { safe: true, multi: false },
        (e, result) => {
            if (e) return next(e)
            res.send((result.result.n === 1) ? { msg: 'success' } : { msg: 'error' })
        })
})