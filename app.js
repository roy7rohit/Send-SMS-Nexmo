const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const Nexmo = require('nexmo');
const socketio = require('socket.io');

// Init nexmo
const nexmo = new Nexmo({
    apiKey: 'API_KEY',
    apiSecret: 'YOUR_SECRET_KEY'
}, { debug: true })

// Init app with express
const app = express();

// template engine setup
app.set('view engine', 'html');
app.engine('html', ejs.renderFile);  // to render html file in ejs view engine

// Public folder setup
app.use(express.static(__dirname + '/public'));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// // Index route
app.get('/', (req, res) => {
    res.render('index');
});

// Catch form submit
// req.body holds the form field that are submitted

app.post('/', (req, res) => {
    // res.send(req.body);
    // console.log(req.body);
    const { number, text } = req.body;

    nexmo.message.sendSms(
        'YOUR_VIRTUAL_NUMBER', number, text, { type: 'unicode' },
        (err, responseData) => {
            if (err) {
                console.log(err);
            } else {
                const { messages } = responseData;
                const { ['message-id']: id, ['to']: number, ['error-text']: error } = messages[0];
                console.dir(responseData);
                // Get data from response
                const data = {
                    id,
                    number,
                    error
                };
                // Emit to the client
                io.emit('smsStatus', data);
            }
        }
    );
});

// Define port
const port = process.env.PORT || 3000

// Start server
const server = app.listen(port, () => console.log(`Server is running on ${port}`));

// Connect to socket.io
const io = socketio(server);
io.on('connection', (socket) => {
    console.log('Connected');
    io.on('disconnect', () => {
        console.log('Disconnected');
    })
}); b