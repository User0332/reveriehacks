const threadID = new URLSearchParams(location.search).get("id");
const messageInput = document.getElementById("message-input");
const socket = io();

socket.on("new-message", (content) => {
	console.log(content);
});

function sendMessage() {
	const messageContent = messageInput.value;

	console.log(messageContent, threadID);

	sendMessageToServer(threadID, messageContent);
}