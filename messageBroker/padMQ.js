class padBroker {
  constructor() {
    this.channels = new Map();
    this.deadLetterChannel = new Map();
  }

  getChannel(name) {
    return this.channels.get(name);
  }

  createChannel(name) {
    console.log("Create CHANNELS HERE>>\n\n");

    let mQueue = [],
      socketQueue = [];
    const channel = this.channels.get(name);
    if (!channel) this.channels.set(name, { mQueue, socketQueue });
  }

  fillDeadLetter(_channel, msg) {
    let mQueue = [];
    const channel = this.deadLetterChannel.get(_channel);
    if (!channel) {
      mQueue.push(msg);
      this.deadLetterChannel.set(_channel, { mQueue });
    } else {
      mQueue = channel.mQueue;
      mQueue.push(msg);
      this.deadLetterChannel.set(_channel, { mQueue });
    }
  }
  checkDeadLetter(channel) {
    const deadLetterC = this.deadLetterChannel.get(channel);
    if(!deadLetterC) return false;
    const deadLetterQueue = deadLetterC && deadLetterC.mQueue;
    if (deadLetterC && deadLetterQueue.length > 0) return true;
    else false;
  }

  addSub(name, socket) {
    const channel = this.channels.get(name);
    channel.socketQueue.push(socket);
    return;
  }

  publish(channel, message) {
    let _channel = this.channels.get(channel);
    // console.log("PUBLISH CHANNEL HERE>>\n\n");
    if (!_channel) {
      this.createChannel(channel);
      _channel = this.channels.get(channel);
    }
    _channel.mQueue.push(message);
    return;
  }
}

module.exports = padBroker;
