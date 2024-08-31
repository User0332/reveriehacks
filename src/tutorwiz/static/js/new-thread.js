const channelID = new URLSearchParams(location.search).get("channelID");

function createThread() {
	const title = document.getElementById("thread-title").value;
	const description = document.getElementById("thread-description").value;

	createThreadAPI(channelID, title, description).then((threadID) => {
		location.href = `/view-thread?id=${threadID}`;
	});
}

getChannelInfo(channelID).then((info) => {
	document.getElementById("heading").value = `Open a New Thread in Channel '${info.name}'`;
});