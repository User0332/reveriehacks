execWithUserData(() => {
	// build channels

	const channelSelect = document.getElementById("channel-select");

	
})

function createThread() {
	const title = document.getElementById("thread-title").value;
	const description = document.getElementById("thread-description").value;
	const channel = document.getElementById("channel-select").value;

	const threadID = createThreadAPI(channel, title, description);

	location.href = `/view-thread?id=${threadID}`;
}