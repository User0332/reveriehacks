const channelID = new URLSearchParams(location.search).get("id");
const threadsContainer = document.getElementById("threads-container");

document.getElementById("new-thread").href = `/new-thread?channelID=${channelID}`;

(async () => {
	const channelInfo = await getChannelInfo(channelID);

	document.getElementById("header").textContent = `Channel '${channelInfo.name}'`;

	for (const threadID of channelInfo.threads.reverse()) {
		const threadInfo = await getThreadInfo(threadID);
		const authorInfo = await getUserInfo(threadInfo.author);

		const threadSummaryDiv = document.createElement("div");
		threadSummaryDiv.className = "thread-summary btn btn-success d-block text-center";

		threadSummaryDiv.append(
			textElem("h4", threadInfo.title),
			textElem("h6", `asked ${authorInfo.name}`)
		);

		threadSummaryDiv.onclick = () => location.href = `/view-thread?id=${threadID}`;

		threadsContainer.appendChild(threadSummaryDiv);
	}
})();