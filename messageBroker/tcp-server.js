const net = require("net");
const MyEmitter = require("./eventEmitter");
const padB = require("./padMQ");
const myEmitter = new MyEmitter(padB);

const server = net.createServer(socket => {
  socket.on("readable", () => {
    myEmitter.msgManager.extractAndEmit.call(myEmitter, socket);
  });
  socket.on("error", err => {
    console.log("TCP SERVER ERROR>>\n\n");
    console.log(err);
  });
});
server.listen(1337, "127.0.0.1", () => {
  console.log("Server Successfuly Connected\n\n");
});
