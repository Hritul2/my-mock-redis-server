import net from "net";
import Parser from "redis-parser";

const store = {};
const server = net.createServer((connection) => {
  console.log("Client connected");

  connection.on("data", (data) => {
    const parser = new Parser({
      returnReply: (reply) => {
        const command = reply[0];
        switch (command) {
          case "PING":
            connection.write("+PONG\r\n");
            break;
          case "SET":
            const key = reply[1];
            const value = reply[2];

            store[key] = value;
            connection.write("+OK\r\n");
            break;
          case "GET":
            const keytoGet = reply[1];
            const valuetoGet = store[key];
            if (!valuetoGet) {
              connection.write("$-1\r\n");
              break;
            }
            connection.write(`$${reply[1].length}\r\n${reply[1]}\r\n`);
            break;
          default:
            connection.write("-ERR unknown command\r\n");
            break;
        }
      },
      returnError: (err) => {
        console.error(`<= ${err}`);
      },
    });
    parser.execute(data);
    connection.write("+OK\r\n");
  });
});

const port = process.env.PORT || 6379;
server.listen(port, () => {
  console.log("Mock Redis server is running on port " + port);
});
