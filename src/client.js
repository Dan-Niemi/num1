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
  const store = Alpine.store("data");
  switch (data.type) {
    case "connection":
      store.cursors = new Map(Object.entries(data.cursors));
      store.id = data.id;
      let rockMap = new Map(data.gameData.rocks.map((r) => [r.id, new Rock(r)]));
      store.rocks = rockMap;
      updateCursors();
      break;
    case "cursorUpdate":
      store.cursors.set(data.id, data.position);
      updateCursors();
      break;
    case "cursorRemove":
      store.cursors.delete(data.id);
      updateCursors();
      break;
    case "chat":
      displayChatMessage(data.id, data.message);
      break;
    case "rockUpdate":
      let movedRock = store.rocks.get(data.id);
      movedRock.pos = createVector(data.pos.x, data.pos.y);
      movedRock.rot = data.rot;
      movedRock.updateGlobalPoints();
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
