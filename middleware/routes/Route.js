const express = require('express');
const router = express.Router();


//----------------------------------GET REQUESTS-------------------------------------

//Render home page
router.get('/', async (req, res) => {
    console.log(req.url);

    res.render('index', {
        user: req.session.user,
    })

});


//404's render
router.get("/*", (req, res) => {
    console.log(req.url);
    res.status(404).write("<h1>Wrong part of the town..</h1> <h3>Go back!</h3>")
    res.end();
})

//----------------------------------MODULE EXPORTS-------------------------------------

module.exports = router;   
