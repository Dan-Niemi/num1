import PartySocket from "partysocket";

const socket = new PartySocket({
  host: PARTYKIT_HOST,
  room: "my-new-room",
});

socket.onopen = (event) => {
  console.log("Connection opened");
  socket.send(JSON.stringify({ type: "greeting", content: "Hello" }));
};

socket.onclose = (event) => {
  console.log("Connection closed");
};

socket.onerror = (error) => {
  console.error("WebSocket error:", error);
};

socket.onmessage = (event) => {
  console.log("Received message:", event.data);
};



