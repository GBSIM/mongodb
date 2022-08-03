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
        
        let comment = new Comment({...req.body, user, userFullName:`${user.name.first} ${user.name.last}`, blog});
        await Promise.all([
            comment.save(),
            Blog.updateOne({_id: blogId}, { $push: { comments: comment}})
        ]);
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

commentRouter.patch('/:commentId', async (req,res) => {
    try {
        const {commentId} = req.params;
        const { content } = req.body;
        if (typeof content !== 'string') return res.status(400).send({err: "content is required"});

        const [comment] = await Promise.all([
            Comment.findOneAndUpdate({_id: commentId}, {content}, {new: true}),
            Blog.updateOne(
                {'comments._id': commentId}, 
                {"comments.$.content": content})
        ]);

        return res.send({ comment })

    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.message})
    }
});

commentRouter.delete('/:commentId', async (req,res) => {
    try {
        const {commentId} = req.params;
        const comment = await Comment.findOneAndDelete({_id: commentId});
        await Blog.updateOne(
            {"comment._id":commentId}, 
            { $pull: { comments: {_id: commentId}}});

        return res.send({ comment })

    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.message})
    }
})

module.exports = { commentRouter }