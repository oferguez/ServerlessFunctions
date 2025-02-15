exports.handler = async () => {
    r = new Date().toLocaleTimeString();
    console.log('serverless function invoked: ', r);
    return {
        statusCode: 200,
        body: JSON.stringify({ time: r })
    };
};
