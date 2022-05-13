const express = require('express');
const app = express();

const PORT = process.env.PORT || 5000;
const pg = require('pg');

const config = {
    user: 'postgres',
    database: 'postgres',
    password: 'postgres',
    port: 5432                  //Default port, change it if needed
};

// pool takes the object above -config- as parameter
const pool = new pg.Pool(config);

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.get('/', (req, res, next) => {
    res.sendFile('dog.jpg', { root: __dirname });
});

app.get('/:state/:disease', (req, res, next) => {
    pool.connect(function (err, client, done) {
        if (err) {
            console.log("Can not connect to the DB" + err);
        }
        client.query(`select latitude, longitude, ${req.params.disease} from mytable where uf = '${req.params.state}'`, function (err, result) {
             done();
             if (err) {
                 console.log(err);
                 res.status(400).send(err);
             }
             res.status(200).send(result.rows);
        })
    })
 });

app.post('/upload', (req, res) => {
    res.send(req.body);
});



app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
