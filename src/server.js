import boardSetup from "../boardSetup.js";

class PartyServer {
  constructor(room) {
    this.room = room;
    this.cursors = new Map();
    this.board = boardSetup(12)
    this.rocks = new Map(this.board.rocks.map((r) => [r.id, r]));
  }
  onConnect(conn, ctx) {
    console.log(
      `Connected:
        id: ${conn.id}
        room: ${this.room.id}
        url: ${new URL(ctx.request.url).pathname}`
    );
    this.cursors.set(conn.id, { x: 0, y: 0 });
    const existingCursors = Object.fromEntries(this.cursors);
    conn.send(JSON.stringify({ type: "connection", cursors: existingCursors, id: conn.id, gameData: this.board }));
  }

  onMessage(message, sender) {
    const data = JSON.parse(message);
    if (data.type === "cursor") {
      this.cursors.set(sender.id, data.position);
      this.broadcastCursorUpdate(sender.id, data.position);
    }
    if (data.type === "rockUpdate") {
      this.rocks.get(data.id).pos = data.pos;
      this.rocks.get(data.id).rot = data.rot;
      this.room.broadcast(
        JSON.stringify({
          type: "rockUpdate",
          pos: data.pos,
          rot: data.rot,
          id: data.id,
        }),
        [sender.id]
      );
    }
  }
  onClose(conn) {
    this.cursors.delete(conn.id);
    this.room.broadcast(
      JSON.stringify({
        type: "cursorRemove",
        id: conn.id,
      })
    );
  }

  broadcastCursorUpdate(id, position) {
    this.room.broadcast(
      JSON.stringify({
        type: "cursorUpdate",
        id: id,
        position: position,
      }),
      [id]
    );
  }
}

export default PartyServer;
