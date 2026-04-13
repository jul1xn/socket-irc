const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const bcrypt = require('bcrypt');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

const database = require('./database');
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("message", (message) => {
        io.to(message.channel).emit("message", message);
    });

    socket.on("joinChannel", (data) => {
        const { username, channel, guest, oldchannel } = data;

        if (channel !== oldchannel && oldchannel) {
            io.to(oldchannel).emit("userLeftChannel", {
                username,
                isGuest: guest
            });
            socket.leave(oldchannel);
        }
        
        socket.join(channel);

        io.to(channel).emit("userJoinedChannel", {
            username,
            isGuest: guest
        });

        console.log(`${username} joined channel ${channel} ${guest ? '(Guest)' : ''}`);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

app.get('/', (req, res) => {
    res.render('connect');
});

app.route('/connect')
.post((req, res) => {
    console.log("Connect request:", req.body);

    if (req.body.guest) {
        return res.sendStatus(200);
    }

    const query = `SELECT * FROM accounts WHERE username = ?`;
    var username = req.body.username.trim().toLowerCase().replace(/\s+/g, '_');
    database.query(query, [username], (err, results) => {
        console.log("Database query result:", err, results);
        if (err) {
            console.error(err);
            return res.sendStatus(500);
        }
        if (results.length === 0) {
            return res.status(404).send('Account not found.');
        }
        var account = results[0];
        if (!bcrypt.compareSync(req.body.password, account.password)) {
            return res.status(401).send('Incorrect password.');
        }
        return res.sendStatus(200);
    });
})
 .get((req, res) => {
    res.redirect('/');
});


app.route('/register')
.post((req, res) => {
    console.log("Register request:", req.body);
    
    const query = `INSERT INTO accounts (username, display_name, password, color_hex) VALUES (?, ?, ?, ?)`;
    var password = bcrypt.hashSync(req.body.password, 10);
    var username = req.body.username.trim().toLowerCase().replace(/\s+/g, '_');
    database.query(query, [username, req.body.username, password, req.body.color], (err, result) => {
        console.log("Database insert result:", err, result);
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).send('Username already exists.');
            }
            console.error(err);
            return res.sendStatus(500);
        }

        return res.sendStatus(201);
    });
})
.get((req, res) => {
    res.render('register');
});

app.get('/chat', (req, res) => {
    res.render('chat');
});

server.listen(port, () => {
    console.log("Server listening on http://localhost:3000");
});