import PartySocket from "partysocket";
let cursors = Alpine.store('data').cursors

const socket = new PartySocket({
  host: PARTYKIT_HOST,
  room: "my-new-room",
});

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
      cursors = new Map(Object.entries(data.cursors));
      id = data.id;
      console.log(id)
      updateCursors();
      break;
    case "cursorUpdate":
      cursors.set(data.id, data.position)
      updateCursors();
      break;
    case "cursorRemove":
      cursors.delete(data.id);
      updateCursors();
      break;
    case "chat":
      displayChatMessage(data.id, data.message);
      break;
  }
};

document.addEventListener("mousemove", (event) => {
  const cursor = { x: event.clientX, y: event.clientY };
  socket.send(JSON.stringify({ type: "cursor", position: cursor }));
});




function createCursor(id) {
  const cursor = document.createElement('div');
  cursor.className = 'cursor';
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


function updateCursors() {
}

