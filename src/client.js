import PartySocket from "partysocket";

window.connectToRoom = (roomName) => {
  let socket = new PartySocket({
    host: PARTYKIT_HOST,
    room: roomName
  })
  socket.onopen = (event) => console.log("Connection opened");
  socket.onclose = (event) => console.log("Connection closed");
  socket.onerror = (error) => console.error("WebSocket error:", error);
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    switch (data.type) {
      case "connection":
        store.id = data.id;
        store.cursors = new Map(Object.entries(data.cursors));
        store.rocks = new Map(Object.entries(data.rocks).map(([key,rock]) => [key,new Rock(rock)]))
        store.hull = new Hull(store.rocks)
        store.rooms = data.rooms
        break;
      case "cursorUpdate":
        store.cursors.set(data.id, data.position);
        break;
      case "cursorRemove":
        store.cursors.delete(data.id);
        break;
      case "updateRock":
        let movedRock = store.rocks.get(data.id);
        movedRock.pos = createVector(data.pos.x, data.pos.y);
        movedRock.rot = data.rot;
        movedRock.updateGlobalPoints();
        break;
      case "deleteRock":
        store.rocks.delete(data.id)
        break;
      case "addRock":
        store.rocks.set(data.rock.id,new Rock(data.rock))
    }
  };
  window.socket = socket
  document.addEventListener("mousemove", (event) => {
    socket.send(JSON.stringify({ type: "cursor", position: { x: event.clientX, y: event.clientY } }));
  });

}

