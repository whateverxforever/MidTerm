const express = require('express');
const Post = require('../../models/Post');
const User = require('../../models/User');
const router = express.Router();

//----------------------------- HELPER FUNCTIONS  ------------------------------------------

const returnPage = async (user, code) => {

    var posts = await Post
        .find({
            course: code
        })
        .sort({ date: -1 })
        .lean()

    var faculty = await User
        .findOne({
            courses: code, isFaculty: true
        })
        .lean()

    return { user: user, posts: posts, trainer: faculty }
}

//-----------------------------GET REQUESTS ------------------------------------------

// Getting posts
router.get('/:code', (req, res) => {
    if (!req.session.user) {
        res.redirect('http://localhost:5000');
    }
    console.log(req.url);

    returnPage(req.session.user, req.params.code)
        .then((data) => {
            res.render('coursePage', data)
        })
        .catch(err => {
            console.log(err);
        })
})


//-----------------------------POST REQUESTS ------------------------------------------

// Saving a post
router.post('/:code', (req, res) => {

    console.log(req.url);
    const { title, body } = req.body;

    const newPost = new Post({
        title,
        body,
        faculty: req.session.user.name,
        course: req.params.code
    })

    newPost.save()
        .then(post => {
            res.redirect("/posts/" + req.params.code);
        })

})

//----------------------------------MODULE EXPORTS-------------------------------------

module.exports = router