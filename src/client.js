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
    const store = Alpine.store("data");
    switch (data.type) {
      case "connection":
        store.playerID = data.id;
        store.cursors = new Map(Object.entries(data.cursors));
        console.log(data.rocks)
        store.rocks = new Map(data.rocks.map(([key,obj]) => [key, new Rock(key,obj)]));
        break;
      case "cursorUpdate":
        store.cursors.set(data.id, data.position);
        break;
      case "cursorRemove":
        store.cursors.delete(data.id);
        break;
      case "rockUpdate":
        let movedRock = store.rocks.get(data.id);
        movedRock.pos = createVector(data.pos.x, data.pos.y);
        movedRock.rot = data.rot;
        movedRock.updateGlobalPoints();
    }
  };
  window.socket = socket
  document.addEventListener("mousemove", (event) => {
    socket.send(JSON.stringify({ type: "cursor", position: { x: event.clientX, y: event.clientY } }));
  });

}

