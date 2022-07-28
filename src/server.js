const express = require('express');
const app = express();
const mongoose = require('mongoose');
const {userRouter, blogRouter, commentRouter} = require('./routes');
const {generateFakeData} = require('../faker');

const MONGO_URI = 'mongodb+srv://oruum:banana1004@oruum.bsopcnz.mongodb.net/BlogService?retryWrites=true&w=majority';

const server = async() => {
    try {
        app.use(express.json());
        await mongoose.connect(MONGO_URI);

        // await generateFakeData(100,10,300);

        app.use('/user',userRouter);
        app.use('/blog',blogRouter);
        app.use('/blog/:blogId/comment',commentRouter);
    
        app.listen(3000,() => console.log('server listening on port 3000'))
    } catch(err) {
        console.log(err);
    }
}

server();