import cluster from "cluster";
import os from "os";
import app from "./app.js";

if (cluster.isPrimary) {
  const numCPUs = Math.max(1, os.cpus().length - 1);

  console.log(`Master ${process.pid} is running`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
  });
} else {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Worker ${process.pid} started. Listening on port ${PORT}`);
  });
}
