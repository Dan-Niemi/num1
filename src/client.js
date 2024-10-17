import PartySocket from "partysocket";

const socket = new PartySocket({
  host: PARTYKIT_HOST,
  room: "my-new-room",
});
window.socket = socket;
socket.onopen = (event) => {
  console.log("Connection opened");
};

socket.onclose = (event) => {
  console.log("Connection closed");
};

socket.onerror = (error) => {
  console.error("WebSocket error:", error);
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  switch (data.type) {
    case "cursorInit":
      Alpine.store("data").cursors = new Map(Object.entries(data.cursors));
      Alpine.store("data").id = data.id;
      let rockMap = new Map(
        data.gameData.rocks.map(r=>[r.id,new Rock(r)])
      )
      Alpine.store("data").rocks = rockMap;
      updateCursors();
      break;
    case "cursorUpdate":
      Alpine.store("data").cursors.set(data.id, data.position);
      updateCursors();
      break;
    case "cursorRemove":
      Alpine.store("data").cursors.delete(data.id);
      updateCursors();
      break;
    case "chat":
      displayChatMessage(data.id, data.message);
      break;
      case "rockUpdate":
      let movedRock = Alpine.store("data").rocks.get(data.id);
      movedRock.pos = createVector(data.pos.x,data.pos.y);
      movedRock.rot = data.rot
      movedRock.updateGlobalPoints()
      console.log(`
        pos:(${movedRock.pos.x} ${movedRock.pos.y})
        rot:(${movedRock.rot}
        `)
        
  }
};

document.addEventListener("mousemove", (event) => {
  const cursor = { x: event.clientX, y: event.clientY };
  socket.send(JSON.stringify({ type: "cursor", position: cursor }));
});

function createCursor(id) {
  const cursor = document.createElement("div");
  cursor.className = "cursor";
  cursor.id = `cursor-${id}`;
  document.body.appendChild(cursor);
  return cursor;
}

function updateCursor(id, x, y) {
  const cursor = document.getElementById(`cursor-${id}`);
  if (cursor) {
    cursor.style.transform = `translate(${x * window.innerWidth}px, ${y * window.innerHeight}px)`;
  }
}

function removeCursor(id) {
  const cursor = document.getElementById(`cursor-${id}`);
  if (cursor) {
    cursor.remove();
  }
}

function updateCursors() {}
