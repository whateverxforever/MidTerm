const express = require('express');
const PORT = process.env.PORT || 5000;
const hbs = require('express-handlebars');
const mongoose = require('mongoose');
const session = require('express-session');

const bodyParser = require('body-parser');
const route = require('./middleware/routes/Route');

//database key
require('dotenv/config');

//controllers
const courseController = require('./middleware/routes/courseController');
const userController = require('./middleware/routes/userController');
const postController = require('./middleware/routes/postController');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.json());


//templating engine
app.set('view engine', 'handlebars');
app.engine('handlebars', hbs());

//session
app.use(session({
    secret: "cat-is-in-the-box",
    resave: false,
    saveUninitialized: false
}))


app.listen(PORT, () => {
    console.log(`Server started at ${PORT} ...`);
})

//database connectivity
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true })
    .then(() => console.log("Database Connected!"))
    .then(() => {
        //routing using middleware
        app.use('/posts', postController);
        app.use('/course', courseController);
        app.use('/user', userController);
        app.use('/', route);


    })
    .catch(err => console.log(err));


