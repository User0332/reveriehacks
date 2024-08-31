const qualificationsContainer = document.getElementById("my-qualifications");
const qualSelect = document.getElementById("select-qual");

execWithUserData(async (userData) => {
	const greeting = document.getElementById("greeting");

	greeting.textContent = `Hello, ${userData.name}`;

	const myThreadsContainer = document.getElementById("my-threads-container");

	for (const threadID of userData.threads) {
		const threadInfo = await getThreadInfo(threadID);
		const channelName = (await getChannelInfo(threadInfo.channel)).name;

		const threadDiv = document.createElement("div");

		threadDiv.className = "thread-summary";

		threadDiv.append(
			textElem("h3", threadInfo.title),
			textElem("h4", `in ${channelName}`)
		);

		myThreadsContainer.appendChild(threadDiv);
	}

	const authorizedChannels = userData.authorizedChannels;

	for (const channelID of authorizedChannels) {
		const channelName = (await getChannelInfo(channelID)).name;

		const qualDiv = document.createElement("div");

		qualDiv.className = "channel-qualification";

		const removeBtn = document.createElement("button");
		removeBtn.textContent = '-';
		
		removeBtn.onclick = () => {
			qualDiv.remove();
			updateQualifications();
		}
	
		const qualHeading = textElem("h3", channelName);
		qualHeading.id = channelID;
		
		qualDiv.append(
			qualHeading,
			removeBtn
		);

		qualificationsContainer.appendChild(qualDiv);
	}

	reloadQualSelect(authorizedChannels);
});

function addQualification() {
	const channelName = qualSelect.options[qualSelect.selectedIndex].text;
	const channelID = qualSelect.value;

	const qualDiv = document.createElement("div");

	qualDiv.className = "channel-qualification";

	const removeBtn = document.createElement("button");
	removeBtn.textContent = '-';
	
	removeBtn.onclick = () => {
		qualDiv.remove();
		updateQualifications();
	}

	const qualHeading = textElem("h3", channelName);
	qualHeading.id = channelID;

	qualDiv.append(
		qualHeading,
		removeBtn
	);
	
	qualificationsContainer.appendChild(qualDiv);

	updateQualifications();
}

function updateQualifications() {
	const quals = [];

	for (const qualDiv of qualificationsContainer.children) {
		const qualHeading = qualDiv.getElementsByTagName("h3")[0];
	
		quals.push(qualHeading.id)
	}

	updateUserInfo(quals).then(reloadQualSelect);
}

async function reloadQualSelect(currentQuals) {
	qualSelect.innerHTML = "";
	
	const allChannels = await getChannels();

	const notQualifiedIn = Object.keys(allChannels)
		.filter(id => !currentQuals.includes(id))
		.reduce((acc, id) => {
			acc[id] = allChannels[id];
			return acc;
		}, {});

	for (const [id, name] of Object.entries(notQualifiedIn)) {
		const option = document.createElement("option");
		option.className

		option.value = id;
		option.text = name;

		qualSelect.appendChild(option);
	}
}