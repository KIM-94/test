const fs = require('fs');

const express = require('express')
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const data = fs.readFileSync('./database2.json');
const conf = JSON.parse(data);
// const mysql = require('mysql');  // ternux mysql (npm install --save mysql) - mysql  Ver 15.1 Distrib 10.5.8-MariaDB, for Android (aarch64) using  EditLine wrapper
const mysql = require('mysql2');    // docker mysql (npm install --save mysql2) - mysql  Ver 8.0.17 for Linux on x86_64 (MySQL Community Server - GPL)


const multer = require('multer');
const upload = multer({ dest: './upload' })


const connection = mysql.createConnection({
  host: conf.host,
  user: conf.user,
  password: conf.password,
  port: conf.port,
  database: conf.database
});
connection.connect();


app.get('/api/customers', (req, res) => {
  connection.query(
    "SELECT * FROM CUSTOMER WHERE isDeleted = 0",
    (err, rows, fields) => {
      res.send(rows);
    }
  );
});

app.use('/image', express.static('./upload'));

app.post('/api/customers', upload.single('image'), (req, res) => {

  let sql = 'INSERT INTO CUSTOMER VALUES (null, ?, ?, ?, ?, ?, now(), 0)';
  let image = '/image/' + req.file.filename;
  let name = req.body.name;
  let birthday = req.body.birthday;
  let gender = req.body.gender;
  let job = req.body.job;
  let params = [image, name, birthday, gender, job];

  connection.query(sql, params,
    (err, rows, fields) => {
      res.send(rows);
    }
  )
});

app.delete('/api/customers/:id', (req, res) => {
  let sql = 'UPDATE CUSTOMER SET isDeleted = 1 WHERE id = ?';
  let params = [req.params.id];
  connection.query(sql, params,
    (err, rows, field) => {
      res.send(rows);
    })
});


app.listen(port, () => console.log(`Litstening on port ${port}`)); 