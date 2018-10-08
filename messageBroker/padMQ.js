const fetch = require("node-fetch");

class padBroker {
  constructor() {
    this.channels = new Map();
    this.deadLetterChannel = new Map();
  }

  getChannel(name) {
    return this.channels.get(name);
  }

  createChannel(name, options = {}) {
    let mQueue = [],
      socketQueue = [],
      data = {};

    if (options.enricher) {
      data = { mQueue, socketQueue, enricher: options.enricher };
    }
    const channel = this.channels.get(name);
    if (!channel) this.channels.set(name, data);
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
    if (!deadLetterC) return false;
    const deadLetterQueue = deadLetterC && deadLetterC.mQueue;
    if (deadLetterC && deadLetterQueue.length > 0) return true;
    else false;
  }

  addSub(name, socket) {
    const channel = this.channels.get(name);
    channel.socketQueue.push(socket);
    return;
  }

  async publish(channel, message) {
    let enricher = {};
    let enrichedMsg = "DEFAULT MESSAGE!!!";
    let _channel = this.channels.get(channel);
    if (_channel.enricher && _channel.enricher.url) {
      enricher = _channel.enricher;
      enricher.options.body = JSON.stringify({ message });
      enricher.options.headers = {
        "Content-Type": "application/json"
      };
      enrichedMsg = await fetch(enricher.url, enricher.options).then(res =>
        res.text()
      );
    }
    if (!_channel) {
      this.createChannel(channel);
      _channel = this.channels.get(channel);
    }
    _channel.mQueue.push(enrichedMsg);
    return;
  }
}

module.exports = padBroker;
