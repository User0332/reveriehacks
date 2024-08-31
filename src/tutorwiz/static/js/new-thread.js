execWithUserData(() => {
	// build channels

	const channelSelect = document.getElementById("channel-select");

	getChannels().then((channels) => {
		for (const [channelID, channelName] of Object.entries(channels)) {
			const option = textElem("option", channelName);
			option.value = channelID;

			channelSelect.appendChild(option);
		}
	});
});

function createThread() {
	const title = document.getElementById("thread-title").value;
	const description = document.getElementById("thread-description").value;
	const channel = document.getElementById("channel-select").value;

	createThreadAPI(channel, title, description).then((threadID) => {
		location.href = `/view-thread?id=${threadID}`;

	});
}