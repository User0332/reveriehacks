const channelID = new URLSearchParams(location.search).get("channelID");
const messagePreview = document.getElementById("message-preview");
const threadDescription = document.getElementById("thread-description");

const md = window.markdownit();

threadDescription.addEventListener('input', () => {
	messagePreview.innerHTML = md.render(threadDescription.value);
});

function createThread() {
	const title = document.getElementById("thread-title").value;
	const description = threadDescription.value;

	createThreadAPI(channelID, title, description).then((threadID) => {
		location.href = `/view-thread?id=${threadID}`;
	});

	const messageElem = elem("div", md.render(messageContent));
	messageElem.className = "message-content";
}

getChannelInfo(channelID).then((info) => {
	document.getElementById("heading").textContent = `Create a New Thread in '${info.name}'`;
});