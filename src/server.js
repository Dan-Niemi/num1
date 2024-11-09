let rooms = [] //room IDs
const WORLDWIDTH = 8000
const WORLDHEIGHT = 8000
const SPAWNRADIUS = 800
const RADMIN = 15
const RADMAX = 120
const POINTSMIN = 5
const POINTSMAX = 12
const NUMROCKS = 10


class PartyServer {
  constructor(room) {
    this.rockCounter = 0;
    this.spawnAttempts = 0;
    this.room = room;
    this.cursors = [];
    this.rocks = [];
    rooms.push(this.room.id)
    while (this.rocks.length < NUMROCKS && this.spawnAttempts < 100) {
      let pos = { x: Math.random() * SPAWNRADIUS , y: Math.random() * SPAWNRADIUS}
      // let pos = { x: Math.random() * SPAWNRADIUS + WORLDWIDTH/2 - SPAWNRADIUS/2, y: Math.random() * SPAWNRADIUS + WORLDHEIGHT/2 - SPAWNRADIUS/2 }
      let rad = Math.random() * (RADMAX - RADMIN) + RADMIN;
      if (this.rocks.some(rock => dist(rock.pos, pos) < rad + rock.rad)) {
        console.log(this.spawnAttempts++)
        continue //if too close to any, go to next loop to get a new random position
      }
      let id = 'rock' + this.rockCounter++
      this.rocks.push(this.newRock(id, pos, rad))
    }

  }
  onConnect(conn, _ctx) {
    this.cursors.push({ id: conn.id, pos: { x: 0, y: 0 } });
    conn.send(JSON.stringify({ type: "connectionSelf", id: conn.id, rocks: this.rocks, room: this.room.id,worldWidth:WORLDWIDTH,worldHeight:WORLDHEIGHT }));
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
      let r = this.newRock(id, data.pos,)
      this.rocks.push(r)
      this.room.broadcast(JSON.stringify({ type: "addRock", rock: r }))
    }

  }
  onClose(conn) {
    this.cursors = this.cursors.filter(cursor => cursor.id !== conn.id)
    this.room.broadcast(JSON.stringify({ type: "cursorRemove", cursors: this.cursors, }));
    if ([...this.room.getConnections()].length < 1) {
      rooms = rooms.filter(room => room !== this.room)
    }

  }


  newRock(id, pos, rad = Math.random() * (RADMAX - RADMIN) + RADMIN) {
    let points = []
    let numPoints = Math.random() * (POINTSMAX - POINTSMIN) + POINTSMIN;
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


function dist(vec1, vec2) {
  return Math.hypot(vec2.x - vec1.x, vec2.y - vec1.y)
}