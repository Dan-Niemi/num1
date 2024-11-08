import PartySocket from "partysocket";
window.socket = null;
window.lobby = new PartySocket({
  host: PARTYKIT_HOST,
  party: "lobby",
  room: "lobby",
})

lobby.onmessage = (event) =>{
  const data = JSON.parse(event.data)
  if(data.type === "lobbyID"){
    store.id = data.id;
  }
  if(data.type ==="playerUpdate"){
    store.players = data.players
  }
}

window.connectToRoom = (roomString) => {
  socket = new PartySocket({
    host: PARTYKIT_HOST,
    room: roomString,
    id: store.id
  })
  socket.onopen = (event) => console.log("Connection opened");
  socket.onclose = (event) => console.log("Connection closed");
  socket.onerror = (error) => console.error("WebSocket error:", error);
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    switch (data.type) {
      case "connectionSelf":
        store.rocks = data.rocks.map(rock => new Rock(rock))
        store.room = data.room
        lobby.send(JSON.stringify({ type: "playerUpdate", room: store.room }))
        break
      case "connection":
        store.cursors = data.cursors;
        store.hull = new Hull(store.rocks)
        store.rooms = data.rooms
        break;
      case "cursorUpdate":
        let c = store.cursors.find(cursor => cursor.id === data.id)
        c.pos = data.pos
        break;
      case "cursorRemove":
        store.cursors = data.cursors
        break;
      case "updateRock":
        let movedRock = store.rocks.find(rock => rock.id === data.id)
        movedRock.pos = createVector(data.pos.x, data.pos.y);
        movedRock.rot = data.rot;
        movedRock.updateGlobalPoints();
        break;
      case "deleteRock":
        store.rocks = store.rocks.filter(rock => rock.id !== data.id)
        break;
      case "addRock":
        store.rocks.push(new Rock(data.rock))
    }
  };
}

