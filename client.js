console.log("client code running.");
const axios = require('axios');
const URI = "http://localhost:3000"

const test = async () => {
    console.time("time: ");
    // let {data: { blogs },} = await axios.get(`${URI}/blog`);

    console.timeEnd("time: ");
}

test();