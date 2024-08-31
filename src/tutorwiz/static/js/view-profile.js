const userID = new URLSearchParams(location.search).get("id");
const qualificationsContainer = document.getElementById("my-qualifications");
const qualSelect = document.getElementById("select-qual");

execWithUserData((selfInfo) => {
	if (selfInfo.id == userID) location.href = "/self-profile";
});

(async () => {
	const userData = await getUserInfo(userID);

	const greeting = document.getElementById("greeting");

	greeting.textContent = `${userData.name}'s Profile`;

	const myThreadsContainer = document.getElementById("my-threads-container");

	for (const threadID of userData.threads) {
		const threadInfo = await getThreadInfo(threadID);
		const channelName = (await getChannelInfo(threadInfo.channel)).name;

		const threadDiv = document.createElement("a");

		threadDiv.className = "thread-summary btn btn-success d-block text-center my-1";

		threadDiv.append(
			textElem("h4", threadInfo.title),
			textElem("h6", `in ${channelName}`)
		);

		threadDiv.href = `/view-thread?id=${threadID}`;

		myThreadsContainer.appendChild(threadDiv);
	}

	const authorizedChannels = userData.authorizedChannels;

	for (const channelID of authorizedChannels) {
		const channelName = (await getChannelInfo(channelID)).name;

		addQualificationManually(channelName, channelID);
	}
})();

function addQualificationManually(channelName, channelID) {
	const qualDiv = document.createElement("div");
	
	qualDiv.className = "d-flex align-items-center";

	const qualHeading = textElem("h3", channelName);
	qualHeading.className = "qual-heading"
	qualHeading.id = channelID;
	
	qualDiv.append(
		qualHeading
	);

	qualificationsContainer.appendChild(qualDiv);
}