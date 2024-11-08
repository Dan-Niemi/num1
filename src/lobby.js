let players = []
let rooms = []

class Lobby {
	constructor(room) {
		this.room = room
		this.resetLobby()
	}
	async onConnect(conn, _ctx) {
		const storedPlayers = await this.room.storage.get('players');
		if (storedPlayers) {
			players = JSON.parse(storedPlayers)
		}
		players.push({ id: conn.id, room: null })
		await this.room.storage.put('players', JSON.stringify(players))
		conn.send(JSON.stringify({ type: "lobbyID", id: conn.id }));
		this.room.broadcast(JSON.stringify({ type: 'playerUpdate', players: players }))
	}
	async onClose(conn) {
		players = players.filter(player => player.id !== conn.id);
		await this.room.storage.put('players', JSON.stringify(players))
		this.room.broadcast(JSON.stringify({ type: 'playerUpdate', players: players }))
	}
	async onMessage(message, sender) {
		const data = JSON.parse(message)
		console.log(data)
		if (data.type === 'playerUpdate') {
			let p = players.find(player => player.id === sender.id);
			p.room = data.room;
			await this.room.storage.put('players', JSON.stringify(players))
			this.room.broadcast(JSON.stringify({ type: 'playerUpdate', players: players }))
		}
	}
	async resetLobby() {
		await this.room.storage.put('players', '[]');
	}
}

export default Lobby;
