class PartyServer {
  constructor(room) {
    this.room = room;
  }

  onConnect(conn, ctx) {
    console.log(
      `Connected:
        id: ${conn.id}
        room: ${this.room.id}
        url: ${new URL(ctx.request.url).pathname}`
    );
    conn.send(JSON.stringify({ type: "welcome", message: "Welcome to the chat!" }));
  }

  onMessage(message, sender) {
    console.log(`connection ${sender.id} sent message: ${message}`);
    this.room.broadcast(`${sender.id}: ${message}`);
  }
}

export default PartyServer;
