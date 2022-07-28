console.log("client code running.");
const axios = require('axios');
const URI = "http://localhost:3000"

const test = async () => {
    let {data: { blogs },} = await axios.get(`${URI}/blog`);

    blogs = await Promise.all(
        blogs.map(async (blog) => {
            try {
                const [res1, res2] = await Promise.all([
                    axios.get(`${URI}/user/${blog.user}`),
                    axios.get(`${URI}/blog/${blog._id}/comment`)
                ]);
                blog.user = res1.data.user;
                console.log(blog.user);
                blog.comments = await Promise.all(res2.data.comments.map(async comment => {
                    const { data: {user}} = await axios.get(`${URI}/user/${comment.user}`)
                    comment.user = user;
                    return comment
                }))
                return blog;
            } catch (err) {
                console.log(err);
            }            
        })
    )
    
    console.dir(blogs[0], { depth: 10 });
    // blogs = await Promise.all(
    //     blogs.map(async (blog) => {
    //         const [res1,res2] = await Promise.all([
    //             axios.get(`${URI}/user/${blog.user}`),
    //             axios.get(`${URI}/blog/${blog._id}/comment`)]);
    //         blog.user = res1.data.user;
    //         blog.comments = await Promise.all(res2.data.comments.map(async comment => {
    //             comment.user = await axios.get(`${URI}/user/${comment.user}`)
    //             return comment;
    //         }))
    //         return blog;
    // }))
}

test();