const rooms = []

const BOARDSIZE = 800
const RADMIN = 20
const RADMAX = 120
const POINTSMIN = 5
const POINTSMAX = 12

class PartyServer {
  constructor(room) {
    this.rockCounter = 0;
    this.room = room;
    rooms.push(this.room.id)
    this.cursors = new Map();
    this.rocks = new Map();
    for (let i = 0; i < 10; i++) {
      let p = { x: Math.random() * BOARDSIZE, y: Math.random() * BOARDSIZE }
      let id = 'rock' + this.rockCounter++
      this.rocks.set(id, this.newRock(id, p))
    }
  }
  onConnect(conn, ctx) {
    this.cursors.set(conn.id, { x: 0, y: 0 });
    const cursorsObj = Object.fromEntries(this.cursors);
    const rocksObj = Object.fromEntries(this.rocks)
    let o = { 
      type: "connection", 
      room: this.room.id, 
      rooms: rooms, 
      cursors: cursorsObj, 
      id: conn.id, 
      rocks: rocksObj 
    }
    conn.send(JSON.stringify(o));
  }

  onMessage(message, sender) {
    const data = JSON.parse(message);
    if (data.type === "cursor") {
      this.cursors.set(sender.id, data.position);
      this.broadcastCursorUpdate(sender.id, data.position);
    }
    if (data.type === "updateRock") {
      this.rocks.get(data.id).pos = data.pos;
      this.rocks.get(data.id).rot = data.rot;
      this.room.broadcast(
        JSON.stringify({
          type: "updateRock",
          pos: data.pos,
          rot: data.rot,
          id: data.id,
        }),
        [sender.id]
      );
    }
    if (data.type === "deleteRock") {
      this.rocks.delete(data.id)
      this.room.broadcast(
        JSON.stringify({
          type: "deleteRock",
          id: data.id
        })
      )
    }
    if (data.type === "addRock") {
      let id = this.rockCounter++
      this.rocks.set(id, this.newRock(id, data.pos))
      this.room.broadcast(
        JSON.stringify({
          type: "addRock",
          rock: this.rocks.get(id)
        })
      )
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
  newRock(id, pos) {
    this.id = id
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
    return { pos: pos, points: points, rad: rad, radMax: RADMAX, id: id }
  }
}

export default PartyServer;


