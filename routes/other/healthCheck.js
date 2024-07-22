
module.exports = async (req, res) => {
    res.success("Health check is successful", { data: "API is up and running" });
};