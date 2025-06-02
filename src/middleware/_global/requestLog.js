export default (req, _, next) => {
    console.log(`Request ${req.method}: ${req.originalUrl}`);
    next();
};