const net = require("net");
const readline = require("readline");
const padMQ = require("./brokerAPI");
const chalk = require("chalk");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: " >"
});

const questionPomise = question => {
  return new Promise((resolve, reject) => {
    rl.question(question, resolve);
  });
};

class ChatCLI {
  constructor() {
    this.username = "";
    this.room = "";
  }
  async init() {
    this.username = await questionPomise("Username: ");
    this.room = await questionPomise("Channel: ");
    const options = {
      // enricher: {
      //   url: "http://localhost:3000/timestamps",
      //   options: {
      //     method: "POST"
      //   }
      // },
      wireTrap: {
        url: "http://localhost:3030/logs",
        options: {
          method: "POST"
        }
      }
    };
    rl.setPrompt(chalk.red("-->"));
    rl.prompt();
    padMQ.openChannel(this.room, options, data => {
      console.log(chalk.green(`${data}`));
      rl.prompt(0);
    });
  }
  sendMsg(msg) {
    msg = `<${this.username}> ${msg}`;
    padMQ.publish(this.room, msg);
  }
}

padMQ
  .connect()
  .then(() => {
    console.log("successfully connected");
    const chatCLI = new ChatCLI();
    chatCLI.init();
    rl.on("line", line => {
      chatCLI.sendMsg(line);
      rl.prompt();
    }).on("close", () => {
      console.log("Have a great day!");
      process.exit(0);
    });
  })
  .catch(err => {
    console.log("Connection error \n" + err);
  });
