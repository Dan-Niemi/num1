class PartyServer {
  constructor(room) {
    this.boardSize = 800;
    this.rockCounter = 0;
    this.room = room;
    this.cursors = new Map();
    this.rocks = new Map();
    for (let i = 0; i < 10; i++) {
      let p = { x: Math.random() * this.boardSize, y: Math.random() * this.boardSize }
      this.rocks.set(this.rockCounter++, this.newRock(p))
    }
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
    conn.send(JSON.stringify({ type: "connection", cursors: existingCursors, id: conn.id, rocks: [...this.rocks] }));
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
    ); ``
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
  newRock(pos) {
    const RADMIN = 30
    const RADMAX = 200
    const POINTSMIN = 5
    const POINTSMAX = 12
    let points = []
    let numPoints = Math.random() * (POINTSMAX - POINTSMIN) + POINTSMIN;
    let rad = Math.random() * (RADMAX - RADMIN) + RADMIN;
    // make points    
    for (let j = 0; j < numPoints; j++) {
      let angle = Math.random() * Math.PI * 2
      let xPos = Math.cos(angle) * rad
      let yPos = Math.sin(angle) * rad
      points.push({ x: xPos, y: yPos })

    }
    // Find the center point
    const cx = points.reduce((sum, b) => sum + b.x, 0) / points.length;
    const cy = points.reduce((sum, b) => sum + b.y, 0) / points.length;
    // Sort Clockwise
    points.sort((a, b) => Math.atan2(b.y - cy, b.x - cx) - Math.atan2(a.y - cy, a.x - cx))
    return { pos: pos, points: points, rad: rad, radMax: RADMAX }
  }
}

export default PartyServer;


