const {Router} = require('express');
const userRouter = Router();
const {User} = require('../models');
const {mongoose} = require('mongoose');

userRouter.get('/', async (req,res) => {
    try {
        const users = await User.find();
        return res.send({ users })
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.message})
    }
});

userRouter.get('/:userId', async (req,res) => {
    const { userId } = req.params;
    console.log(userId);
    try {
        if (!mongoose.isValidObjectId(userId)) return res.status(400).send({err:"Invalid user id"})
        const user = await User.findOne({_id: userId});
        return res.send({user})
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.message})
    }
});

userRouter.post('/', async (req,res) => {
    try {
        let {username, name} = req.body;
        if(!username) return res.status(400).send({err: "Username is required"})
        if(!name || !name.first || !name.last) return res.status(400).send({err: "Both first and last name are required"})

        const user = new User(req.body);
        await user.save();
        return res.send({ user })
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.message})
    }
});

userRouter.delete('/:userId', async(req,res) => {
    const { userId } = req.params;
    try {
        if (!mongoose.isValidObjectId(userId)) return res.status(400).send({err:"Invalid user id"})
        const user = await User.findOneAndDelete({_id: userId});
        return res.send({ user })
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.message})
    }
});

userRouter.put('/user/:userId', async(req,res) => {
    const { userId } = req.params;
    try {
        if (!mongoose.isValidObjectId(userId)) return res.status(400).send({err:"Invalid user id"})
        const { age, name } = req.body;
        if (!age && !name) return res.status(400).send({err:"age or name is required"})
        if (typeof age !== 'number') res.status(400).send({err:"age must be number"})
        const user = await User.findByIdAndUpdate(userId,{$set: { age, name }},{new: true});
        return res.send({ user })
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: err.message})
    }
});

module.exports = { userRouter }