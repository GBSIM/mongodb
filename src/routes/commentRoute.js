const {Router} = require('express');
const commentRouter = Router({mergeParams: true});
const {User, Blog, Comment} = require('../models');
const {isValidObjectId} = require('mongoose');

commentRouter.post('/', async (req,res) => {
    try {
        const {blogId} = req.params;
        const {content, userId} = req.body;
        if (typeof content !== 'string') return res.status(400).send({err: "content is required"})
        if (!isValidObjectId(userId)) return res.status(400).send({err: "userId is invalid"})
        if (!isValidObjectId(blogId)) return res.status(400).send({err: "blogId is invalid"})

        const [user, blog] = await Promise.all([
            User.findById(userId),
            Blog.findById(blogId)
        ])

        if (!user) return res.status(400).send({err: "user doest not exist"})
        if (!blog) return res.status(400).send({err: "blog doest not exist"})

        if (!blog.islive) return res.status(400).send({err: "blog is not available"})
        
        let comment = new Comment({...req.body, user, blog});
        await comment.save();
        return res.send({ comment })
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.message})
    }
});

commentRouter.get('/', async (req,res) => {
    try {
        const {blogId} = req.params;
        if (!isValidObjectId(blogId)) return res.status(400).send({err: "blogId is invalid"})
        let blog = await Blog.findById(blogId);
        if (!blog) return res.status(400).send({err: "blog doest not exist"})

        const comments = await Comment.find({blog: blogId});

        return res.send({ comments })
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.message})
    }
});

module.exports = { commentRouter }