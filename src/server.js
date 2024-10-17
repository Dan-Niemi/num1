import * as gameData from "../GameData.json";


class PartyServer {
  constructor(room) {
    this.room = room;
    this.cursors = new Map();
    this.seed = "dan";
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
    conn.send(JSON.stringify({ type: "cursorInit", cursors: existingCursors, id: conn.id, gameData: gameData }));
  }

  onMessage(message, sender) {
    const data = JSON.parse(message);
    if (data.type === "cursor") {
      this.cursors.set(sender.id, data.position);
      this.broadcastCursorUpdate(sender.id, data.position);
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
