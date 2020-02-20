const express = require('express');
const User = require('../../models/User');
const Course = require('../../models/Course');
const bcrypt = require('bcryptjs');

const router = express.Router();

// ------------------------------ HELPER FUNCTIONS --------------------------------------
const removeCourse = async (id, courses, code) => {

    const process = await User.findOneAndUpdate(
        {
            id: id
        },
        {
            courses: courses.filter(course => course !== code)
        },
        {
            new: true
        })


    const midPromise = await Course.deleteOne(
        {
            code: code
        },
        {
            new: true
        })

    return process;

}


//------------------------------------ GET REQUESTS ------------------------------------

// Subscribe a course to the user
router.get('/subscribe/:code', (req, res) => {
    console.log(req.url);


    if (!req.session.user || req.session.user.isFaculty) {
        req.session.message = "Only students can Subscribe!";
        return res.redirect('/course');
    }

    const id = req.session.user.id;

    if (req.session.user.courses.includes(req.params.code)) {
        req.session.message = "Already added!";
        return res.redirect('/course');
    }

    User.findOneAndUpdate(
        {
            id: id
        },
        {
            courses: [...req.session.user.courses, req.params.code]
        },
        {
            new: true
        })
        .then((user) => {
            req.session.user = user;
            req.session.message = "Success!";
            res.redirect('/course');
        })
        .catch(err => {
            console.log(err);

        })

})


// Remove a course from the database
router.get('/remove/:code', (req, res) => {
    console.log(req.url);

    removeCourse(req.session.user.id, req.session.user.courses, req.params.code)
        .then((user) => {
            req.session.user = user;
            req.session.message = "removed";
            res.redirect('/user/profile');
        })
        .catch(err => {
            console.log(err);
        })
})


// User login
router.get('/login', (req, res) => {
    console.log(req.url);
    res.render('login');
});


// User registeration
router.get('/signup', (req, res) => {
    console.log(req.url);

    res.render('signup');
});


// Fetch a profile 
router.get('/profile', (req, res) => {

    const msg = req.session.message;
    req.session.message = null;

    if (!req.session.user) {
        return res.redirect('/');
    }
    res.render('profile', { user: req.session.user, msg: msg })
})


// Logout  
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
})


//-----------------------------POST REQUESTS------------------------------------------


// User Login
router.post('/login', async (req, res) => {
    const { id, password } = req.body;
    if (!id || !password) {
        return res.status(400).render('login', { error: "Fill all the fields" });
    }
    try {
        // verifcation
        var user = await User.findOne({ "id": id }).exec();
        if (!user) {

            return res.status(400).render('login', { error: "The username does not exist" });
        }
        if (!bcrypt.compareSync(password, user.password)) {
            console.log(2);

            return res.status(400).render('login', { error: "The password is invalid" });
        }

        req.session.user = user;
        console.log(req.session.user.id);

        res.redirect('http://localhost:5000/');
    } catch (error) {
        res.status(500).json(error);
    }
})


// User Registeration
router.post("/signup", async (req, res) => {

    // validation 
    let errors = [];
    const { first_name, last_name, reg, email, password } = req.body;
    const name = first_name + " " + last_name;
    const isFaculty = req.body.faculty ? true : false;

    //check entered fields
    if (!name || !email || !password || !reg) {
        errors.push({ id: "no_data", msg: "Enter all required fields!" });
    }

    User.findOne(
        { id: reg }
    ).then(user => {
        if (user) {
            errors.push({ id: "existing_user", msg: "User already exists!" })
        }
    })

    if (errors.length > 0) {
        res.render('signup', { error: errors });
    }
    else {
        const newUser = new User({
            id: reg,
            name,
            email,
            password,
            isFaculty
        });
        try {
            newUser.password = await bcrypt.hash(newUser.password, 10)
            newUser.save()
                .then(user => {
                    console.log(user)
                    res.redirect('/user/login')
                })
                .catch(err => console.log(err));
        }
        catch (error) {
            console.log(error);
        }

    }

})

module.exports = router;   
