const threadID = new URLSearchParams(location.search).get("id");
const messageInput = document.getElementById("message-input");
const messageContainer = document.getElementById("message-container");
const socket = io();

socket.on("new-message", renderLocalMessage);

async function renderDBMessage(messageInfo) {
	const authorName = (await getUserInfo(messageInfo.author)).name;
	const messageContent = messageInfo.content;

	const messageDiv = document.createElement("div");
	messageDiv.className = "message";

	const authorElem = textElem("span", `${authorName}: `);
	authorElem.className = "author-name";

	const messageElem = textElem("span", messageContent);
	messageElem.className = "message-content";

	messageDiv.append(
		authorElem,
		messageElem
	);

	messageContainer.appendChild(messageDiv);
}

async function renderLocalMessage(content) {
	const authorName = authInfo.user.firstName;
	const messageContent = content;

	const messageDiv = document.createElement("div");
	messageDiv.className = "message";

	const authorElem = textElem("span", `${authorName}: `);
	authorElem.className = "author-name";

	const messageElem = textElem("span", messageContent);
	messageElem.className = "message-content";

	messageDiv.append(
		authorElem,
		messageElem
	);

	messageContainer.appendChild(messageDiv);
}

async function renderAllDBMessages() {
	const messages = (await getThreadInfo(threadID)).messages;

	for (const messageID of messages) {
		renderDBMessage(
			await getMessageInfo(messageID)
		);
	}
}

function sendMessage() {
	const messageContent = messageInput.value;

	sendMessageToServer(threadID, messageContent);
}

getThreadInfo(threadID).then((threadInfo) => {
	document.getElementById("thread-title").textContent = threadInfo.title;
	document.getElementById("thread-description").textContent = threadInfo.description;
})

renderAllDBMessages();