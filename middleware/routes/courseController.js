const express = require('express');
const User = require('../../models/User');
const Course = require('../../models/Course');

const router = express.Router();

//-----------------------------HELPER FUNCTIONS------------------------------------------
const deleteCourse = async (code) => {
    const process = await Course.deleteOne({ code: code }, { new: true })
    return process;
}

//-----------------------------GET REQUESTS------------------------------------------

//Course page
router.get('/', (req, res) => {
    console.log(req.url);

    const message = req.session.message;
    req.session.message = null;

    Course.find()
        .lean()
        .sort()
        .then(courses => {
            res.render('courses', {
                courses,
                user: req.session.user,
                message
            })
        });
});

//Remove a course
router.get('/remove/:code', (req, res) => {
    console.log(req.url);

    deleteCourse(req.params.code)
        .then(() => {
            req.session.message = "removed";
            res.redirect('/course');
        })
        .catch(err => {
            console.log(err);
        })
})

//Add a course
router.get('/add', (req, res) => {
    console.log(req.url);

    if (!req.session.user) {
        return;
    }
    res.render('addCourse', { user: req.session.user });
})


//-----------------------------POST REQUESTS------------------------------------------

//Add a new course
router.post('/add', async (req, res) => {

    console.log(req.url + "POST");

    const { code, title } = req.body;
    let errors = [];

    //check entered fields
    if (!code || !title) {
        errors.push({ id: "no_data", msg: "Enter all required fields!" });
    }

    if (errors.length > 0) {
        res.render('addCourse', { error: "Enter all fields!" });
    }
    else {

        Course.findOne({
            code: code
        }).then(course => {
            if (course) {
                req.session.message = "Already added!";
                res.render('addCourse', { success: "Already added!", user: req.session.user });
            }

            else {

                const newCourse = new Course({
                    code,
                    title,
                    faculty: req.session.user.name
                });

                try {
                    newCourse.save()
                        .then(course => {
                            console.log(course)
                            User.findOneAndUpdate(
                                {
                                    id: req.session.user.id
                                },
                                {
                                    courses: [...req.session.user.courses, code]
                                },
                                {
                                    new: true
                                })
                                .then((user) => {
                                    req.session.user = user;
                                    console.log(user);

                                    req.session.message = "Success!";
                                    res.render('addCourse', { success: "Successfully added!", user: req.session.user })

                                })
                                .catch(err => {
                                    console.log(err);
                                })
                        })
                        .catch(err => console.log(err));
                }
                catch (error) {
                    console.log(error);
                }

            }
        })



    }

})




module.exports = router;   
