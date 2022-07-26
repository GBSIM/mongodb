const {Router} = require('express');
const commentRouter = Router({mergeParams: true});
const {User, Blog, Comment} = require('../models');
const {isValidObjectId, startSession} = require('mongoose');

commentRouter.post('/', async (req,res) => {
    const session = await startSession();
    let comment;
    try {
        await session.withTransaction(async() => {
            const {blogId} = req.params;
            const {content, userId} = req.body;
            if (typeof content !== 'string') return res.status(400).send({err: "content is required"})
            if (!isValidObjectId(userId)) return res.status(400).send({err: "userId is invalid"})
            if (!isValidObjectId(blogId)) return res.status(400).send({err: "blogId is invalid"})
    
            const [user, blog] = await Promise.all([
                User.findById(userId, {}, { session }),
                Blog.findById(blogId, {}, { session })
            ])
    
            if (!user) return res.status(400).send({err: "user doest not exist"})
            if (!blog) return res.status(400).send({err: "blog doest not exist"})
    
            if (!blog.islive) return res.status(400).send({err: "blog is not available"})
            
            comment = new Comment({
                content,
                user, 
                userFullName:`${user.name.first} ${user.name.last}`, 
                blog: blogId
            });
            // await session.abortTransaction();
            // await Promise.all([
            //     comment.save(),
            //     Blog.updateOne({_id: blogId}, { $push: { comments: comment}})
            // ]);
            // await comment.save();
            
            blog.commentsCount++;
            blog.comments.push(comment);
            if (blog.commentsCount > 3) blog.comments.shift();
            await Promise.all([
                comment.save({ session }), 
                blog.save()
            ]);
        });
        return res.send({ comment });
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.message})
    } finally {
        await session.endSession();
    }
});

commentRouter.get('/', async (req,res) => {
    let { page = 0 } = req.query;
    page = parseInt(page);
    const {blogId} = req.params;
    try {
        if (!isValidObjectId(blogId)) return res.status(400).send({err: "blogId is invalid"})
        let blog = await Blog.findById(blogId);
        if (!blog) return res.status(400).send({err: "blog doest not exist"})

        const comments = await Comment.find({blog: blogId}).sort({ createAt: -1 }).skip( page * 3).limit( 3);

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