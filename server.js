const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
 const db = new sqlite3.Database('./traffic-lights.db');   // traffic light db

// Middleware to parse JSON

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Create table to store traffic light intervals

db.serialize(() => {
    db.run("CREATE TABLE traffic_lights (id INTEGER PRIMARY KEY AUTOINCREMENT, sequence TEXT, yellow_interval INTEGER, green_interval INTEGER)");
});

// Saving data to the db

app.post('/save', (req, res) => {
    const { sequence, yellowInterval, greenInterval } = req.body;
    db.run("INSERT INTO traffic_lights (sequence, yellow_interval, green_interval) VALUES (?, ?, ?)", 
        [sequence, yellowInterval, greenInterval], 
        function(err) {
            
            if (err) {
                return res.status(500).send("Database error: " + err.message);
            }
            res.send({ message: 'Data saved successfully', id: this.lastID });
        });
});

// Loading  latest data from the db

app.get('/load', (req, res) => {
    
    db.get("SELECT * FROM traffic_lights ORDER BY id DESC LIMIT 1", (err, row) => {
    if (err) {
            return res.status(500).send("Database error: " + err.message);
        }
        res.send(row || {});
    });
});

// serve the static html css and js files
   app.use(express.static('public'));

//start the serve

 app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
