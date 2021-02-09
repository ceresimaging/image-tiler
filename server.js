import app from "./app";

// Start Server
export default app.listen(process.env.PORT, process.env.HOST, () => {
  if (process.env.NODE_ENV !== "test") {
    console.info(`Running on http://${process.env.HOST}:${process.env.PORT}`);
  }
});
