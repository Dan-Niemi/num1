let rooms = [] //room IDs
const BOARDSIZE = 800
const RADMIN = 20
const RADMAX = 120
const POINTSMIN = 5
const POINTSMAX = 12
const NUMROCKS = 10

class PartyServer {
  constructor(room) {
    this.rockCounter = 0;
    this.room = room;
    rooms.push(this.room.id)
    this.cursors = [];
    this.rocks = [];
    for (let i = 0; i < NUMROCKS; i++) {
      let p = { x: Math.random() * BOARDSIZE, y: Math.random() * BOARDSIZE }
      let id = 'rock' + this.rockCounter++
      this.rocks.push(this.newRock(id, p))
    }
    
  }
  onConnect(conn, _ctx) {
    this.cursors.push({ id: conn.id, pos: { x: 0, y: 0 } });
    conn.send(JSON.stringify({ type: "connectionSelf", id: conn.id,rocks: this.rocks,room:this.room.id }));
    this.room.broadcast(JSON.stringify({ type: "connection", rooms: rooms, cursors: this.cursors }));
  }

  onMessage(message, sender) {
    const data = JSON.parse(message);
    if (data.type === "cursorUpdate") {
      let c = this.cursors.find(cursor => cursor.id === sender.id)
      c.pos = data.pos
      this.room.broadcast(JSON.stringify({ type: "cursorUpdate", id: sender.id, pos: data.pos }), [sender.id]);
    }
    if (data.type === "updateRock") {
      let r = this.rocks.find(rock => rock.id === data.id)
      r.pos = data.pos;
      r.rot = data.rot;
      this.room.broadcast(JSON.stringify({ type: "updateRock", pos: data.pos, rot: data.rot, id: data.id, }), [sender.id]);
    }
    if (data.type === "deleteRock") {
      this.rocks = this.rocks.filter(rock => rock.id !== data.id)
      this.room.broadcast(JSON.stringify({ type: "deleteRock", id: data.id }))
    }
    if (data.type === "addRock") {
      let id = this.rockCounter++
      let r = this.newRock(id, data.pos)
      this.rocks.push(r)
      this.room.broadcast(JSON.stringify({ type: "addRock", rock: r }))
    }

  }
  onClose(conn) {
    this.cursors = this.cursors.filter(cursor => cursor.id !== conn.id)
    this.room.broadcast(JSON.stringify({ type: "cursorRemove", cursors: this.cursors, }));
    if([...this.room.getConnections()].length<1){
      rooms = rooms.filter(room => room !== this.room)
    }

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


