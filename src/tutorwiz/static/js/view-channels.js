const channelsContainer = document.getElementById("channels-container");

(async () => {
	const channels = await getChannels();
	
	for (const [channelID, channelName] of Object.entries(channels)) {
		const summaryDiv = document.createElement("div");

		const anchor = textElem('a', channelName);
		anchor.className = "btn btn-success my-1  d-block text-center"
		anchor.href = `/view-channel?id=${channelID}`;

		summaryDiv.appendChild(anchor);

		channelsContainer.appendChild(summaryDiv);
	}
})();