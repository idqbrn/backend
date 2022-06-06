const express = require('express');
const app = express();

const PORT = process.env.PORT || 5000;
const pg = require('pg');
const cors = require('cors');
const corsOptions ={
    origin:'http://localhost:3000', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}
app.use(cors(corsOptions));
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

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));


app.get('/', (req, res, next) => {
    res.send('<h1>Backend tá vivo</h1>');
 });

app.get('/disease/:disease', (req, res, next) => {
    pool.connect(function (err, client, done) {
        if (err) {
            console.log("Can not connect to the DB" + err);
        }
        client.query(`
            SELECT
                latitude as lat,
                longitude as lng,
                total as count
            FROM idqbrn.cases
            INNER JOIN idqbrn.places
                ON idqbrn.cases.place_id = idqbrn.places.code
            WHERE disease_id = '${req.params.disease}'`, function (err, result) {
             done();
             if (err) {
                 console.log(err);
                 res.status(400).send(err);
             }
             res.status(200).send(result.rows);
        })
    })
 });


app.post('/crud', (req, res, next) => {
    pool.connect(function (err, client, done) {
        if (err) {
            console.log("Can not connect to the DB" + err);
        }
        const body = req.body;
        client.query(`INSERT INTO idqbrn.disease (name_id, description, treatments, vector, image)
        VALUES ('${body.name_id}', '${body.description}', '${body.treatments}', '${body.vector}', Null);`, function (err, result) {
             done();
             if (err) {
                 console.log(err);
                 res.status(400).send(err);
             }
             res.status(200).send(req.body);
        })
    })
 });

 app.delete('/crud',cors(), (req, res, next) => {
    pool.connect(function (err, client, done) {
        if (err) {
            console.log("Can not connect to the DB" + err);
        }
        const body = req.body;
        client.query(`DELETE FROM idqbrn.disease WHERE name_id = '${body.name_id}'`, function (err, result) {
             done();
             if (err) {
                 console.log(err);
                 res.status(400).send(err);
             }
             res.status(200).send(req.body);
        })
    })
 });

 app.post('/upload', (req, res, next) => {
    pool.connect(function (err, client, done) {
        if (err) {
            console.log("Can not connect to the DB" + err);
        }
        // console.log(req.body[0])
        const body = req.body;
        body.forEach(element => {
            // console.log(element);
            client.query(`INSERT INTO idqbrn.cases (total, place_id, disease_id, user_id, created_at, deleted_at)
            VALUES ('${element.total}', '${element.place_id}', '${element.disease_id}', '${element.user_id}','${element.created_at}', ${element.deleted_at ? element.deleted_at : 'null'});`, function (err, result) {
                 done();
                 if (err) {
                     console.log(err);
                     res.status(400).send(err);
                 }
            })
        });
        res.status(200).send(body);
    })
 });

//Dashboards


app.get('/dashboard/total/:disease', (req, res, next) => {
    pool.connect(function (err, client, done) {
        if (err) {
            console.log("Can not connect to the DB" + err);
        }
        client.query(`select sum(total) from idqbrn.cases where disease_id = '${req.params.disease}'`, function (err, result) {
             done();
             if (err) {
                 console.log(err);
                 res.status(400).send(err);
             }
             res.status(200).send(result.rows);
        })
    })  
 });


 app.get('/dashboard/max/:disease', (req, res, next) => {
    pool.connect(async function (err, client, done) {
        if (err) {
            console.log("Can not connect to the DB" + err);
        }
        client.query(`select place_id, total
        from idqbrn.cases
        where total = (
            select max(total)
            from idqbrn.cases
        )`, function (err, result) {
             if (err) {
                 console.log(err);
                 res.status(400).send(err);
             }
             res.status(200).send(result.rows);
        })
    })
 });

 app.get('/places/:code', (req, res, next) => {
    pool.connect(async function (err, client, done) {
        if (err) {
            console.log("Can not connect to the DB" + err);
        }
        client.query(`select city from idqbrn.places where code = ${req.params.code}`, function (err, result) {
             if (err) {
                 console.log(err);
                 res.status(400).send(err);
             }
             res.status(200).send(result.rows);
        })
    })
 });

 app.get('/diseasesName', (req, res, next) => {
    pool.connect(async function (err, client, done) {
        if (err) {
            console.log("Can not connect to the DB" + err);
        }
        client.query(`select name_id from idqbrn.disease`, function (err, result) {
             if (err) {
                 console.log(err);
                 res.status(400).send(err);
             }
             res.status(200).send(result.rows);
        })
    })
 });
