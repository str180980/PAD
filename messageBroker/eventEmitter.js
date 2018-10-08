const EventEmitter = require("events");

class MessageManager {
  extractAndEmit(socket) {
    let chunk, message, messageLenght;
    while ((chunk = socket.read(4)) !== null) {
      messageLenght = chunk && chunk.readUInt32BE(0);
      message = socket.read(messageLenght);
      message = JSON.parse(message.toString());
      this.emit(message.headers.event, message, socket);
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

class MyEmitter extends EventEmitter {
  constructor(mBroker) {
    super();
    this.mBroker = new mBroker();
    this.msgManager = new MessageManager();
    this.on("openChannel", this.openChannel);
    this.on("publish", this.publish);
    this.on("notifySubs", this.notifySubs);
    this.on("deadLetterPublish", this.deadLetterPublish);
  }

  openChannel({ payload, options }, socket) {
    this.mBroker.createChannel(payload.channel, options);
    this.mBroker.addSub(payload.channel, socket);
    if (this.mBroker.checkDeadLetter(payload.channel)) {
      this.emit("deadLetterPublish", payload.channel, socket);
    }
  }

  async publish({ payload, headers }, socket) {
    await this.mBroker.publish(headers.channel, payload);
    this.emit("notifySubs", headers.channel, socket);
  }

  deadLetterPublish(channel, socket) {
    const deadLetterChannel = this.mBroker.deadLetterChannel.get(channel),
      mQueue = deadLetterChannel.mQueue;
    mQueue.forEach(msg => {
      socket.write(msg);
    });
  }

  notifySubs(channel, currentSocket) {
    const _ch = this.mBroker.getChannel(channel),
      payload = _ch.mQueue.shift(),
      message = JSON.stringify({ channel, payload }),
      outBuff = this.msgManager.createBuffer(message);

    console.log("NOTIFY MESSAGE!!!!>\n\n\n");
    console.log(message);

    _ch.socketQueue.forEach(socket => {
      if (currentSocket.remotePort === socket.remotePort) return;

      if (!socket.destroyed) socket.write(outBuff);
      else {
        this.mBroker.fillDeadLetter(channel, outBuff);
      }
    });
  }
}

module.exports = MyEmitter;
