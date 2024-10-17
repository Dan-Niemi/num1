let socket;

document.getElementById("roomForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const roomName = document.getElementById("roomName").value;
  if (roomName) {
    joinRoom(roomName);
  }
});

function joinRoom(roomName) {
  socket = new PartySocket({
    host: "YOUR_PARTYKIT_HOST",
    room: roomName,
  });

  socket.addEventListener("message", function (event) {
    const data = JSON.parse(event.data);
    if (data.type === "chatMessage") {
      addMessage(data);
    } else if (data.type === "welcome") {
      console.log(data.message);
    }
  });

  document.getElementById("roomTitle").textContent = `Room: ${roomName}`;
  document.getElementById("chatRoom").style.display = "block";
  document.getElementById("roomForm").style.display = "none";
}

document.getElementById("messageForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const messageInput = document.getElementById("messageInput");
  const message = messageInput.value;
  if (message && socket) {
    socket.send(JSON.stringify({ type: "chatMessage", message }));
    messageInput.value = "";
  }
});

function addMessage(data) {
  const li = document.createElement("li");
  li.textContent = `${data.userId}: ${data.message}`;
  document.getElementById("messages").appendChild(li);
}
