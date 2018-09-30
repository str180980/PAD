const EventEmitter = require("events");
const net = require("net");

class MessageManager {
  extractAndEmit() {
    let chunk, message, messageLenght;
    while ((chunk = this.socket.read(4)) !== null) {
      messageLenght = chunk && chunk.readUInt32BE(0);
      message = this.socket.read(messageLenght);
      message = JSON.parse(message.toString());
      this.emit(message.channel, message.payload);
    }
  }

  createBuffer(message) {
    let _message = Buffer.from(message);
    let outBuff = Buffer(4 + _message.length);
    outBuff.writeUInt32BE(_message.length, 0);
    _message.copy(outBuff, 4);

    return outBuff;
  }
}

class brokerAPI extends EventEmitter {
  constructor() {
    super();
    this.socket = new net.Socket();
    this.msgManager = new MessageManager();
    this.socket.on("readable", () => {
      this.msgManager.extractAndEmit.call(this);
    });
  }

  connect(rl) {
    return new Promise((resolve, reject) => {
      this.socket.connect(
        1337,
        "127.0.0.1",
        resolve
      );
      this.socket.on("error", reject);
    });
  }

  openChannel(name, callback) {
    let _message = JSON.stringify({
      headers: {
        event: "openChannel"
      },
      payload: {
        channel: name
      }
    });

    _message = Buffer.from(_message);
    const outBuff = Buffer(4 + _message.length);
    outBuff.writeUInt32BE(_message.length, 0);

    _message.copy(outBuff, 4);

    this.socket.write(outBuff, () => {
      this.on(name, callback);
    });
  }

  publish(channel, message) {
    let _message = JSON.stringify({
      headers: {
        event: "publish",
        channel: channel
      },
      payload: message
    });
    const outBuff = this.msgManager.createBuffer(_message);
    this.socket.write(outBuff);
  }
}

module.exports = new brokerAPI();
