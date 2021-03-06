const express = require('express');
const app = express();
var format = require('pg-format');
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


app.get('/', function (req, res) {
    res.sendFile('C:\\Users\\danie\\Documents\\backend\\dog.jpg');
});



// admin

app.get('/admin/search/:disease/:state', (req, res, next) => {
    pool.connect(function (err, client, done) {
        if (err) {
            console.log("Can not connect to the DB" + err);
        }
        
        client.query(`
            SELECT
                c.disease_id,
                p.state,
                p.city,
                c.total
            FROM idqbrn.cases c
            INNER JOIN idqbrn.places p
                ON c.place_id = p.code
            WHERE c.disease_id ='${req.params.disease}'
                AND p.state ='${req.params.state}'`, function (err, result) {
             done();
             if (err) {
                 console.log(err);
                 res.status(400).send(err);
             }
             res.status(200).send(result.rows);
        })
    })
 });

app.get('/disease/info', (req, res, next) => {
    pool.connect(function (err, client, done) {
        if (err) {
            console.log("Can not connect to the DB" + err);
        }
        client.query(`
            SELECT
                name_id,
                description,
                treatments,
                vector,
                image
            FROM idqbrn.diseases`, function (err, result) {
             done();
             if (err) {
                 console.log(err);
                 res.status(400).send(err);
             }
             res.status(200).send(result.rows);
        })
    })
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
        client.query(format(`INSERT INTO idqbrn.disease (name_id, description, treatments, vector, image) VALUES %L`, values),[], function (err, result) {
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
    pool.connect( async function (err, client, done) {
        if (err) {
            console.log("Can not connect to the DB" + err);
        }
        const body = req.body.vector;
        const doubles = body.map(num => {
            return Object.values(num)
        })
       
        console.log(doubles)
        client.query('INSERT INTO idqbrn.cases (total,  disease_id, place_id,user_id, created_at, deleted_at) VALUES ' + doubles,[], async function (err, result) {
       
        if (err) {
            client.release()       
            console.log(err);
            res.status(400).json({
               status_code: 0,
               error_msg: "Require Params Missing",
             });
             
        }else{
            client.release()
            res.status(200).send(body);
        }
        
        
    })
    
 });
 });


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
        client.query(`
            SELECT
                p.state,
                p.city,
                c.total
            FROM idqbrn.cases c
            INNER JOIN idqbrn.places p
                ON c.place_id = p.code
            WHERE c.total = (
                SELECT max(c2.total)
                FROM idqbrn.cases c2
                WHERE c.disease_id = c2.disease_id
            )
            AND c.disease_id = '${req.params.disease}'`, function (err, result) {
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

 app.get('/dashboard/chart/:state/:city', (req, res, next) => {
    pool.connect(function (err, client, done) {
        if (err) {
            console.log("Can not connect to the DB" + err);
        }
        
        client.query(`
            SELECT
                c.disease_id,
                c.total
            FROM idqbrn.cases c
            INNER JOIN idqbrn.places p
                ON c.place_id = p.code
            WHERE p.state ='${req.params.state}'
                AND p.city ='${req.params.city}'`, function (err, result) {
             done();
             if (err) {
                 console.log(err);
                 res.status(400).send(err);
             }
             res.status(200).send(result.rows);
        })
    })
 });