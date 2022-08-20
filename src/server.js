const express = require('express');
const app = express();
const mongoose = require('mongoose');
const {userRouter, blogRouter, commentRouter} = require('./routes');
const {generateFakeData} = require('../faker2');


const server = async() => {
    try {
        const { MONGO_URI } = process.env;
        if (!MONGO_URI) throw new Error("MONGO_URI is required!!");

        app.use(express.json());
        await mongoose.connect(MONGO_URI);

        // await generateFakeData(100,10,300);
        // mongoose.set("debug", true);
        app.use('/user',userRouter);
        app.use('/blog',blogRouter);
        app.use('/blog/:blogId/comment',commentRouter);
    
        app.listen(3000,async () => {
            console.log('server listening on port 3000');
            // await generateFakeData(10, 2, 10);
        })
    } catch(err) {
        console.log(err);
    }
}

server();