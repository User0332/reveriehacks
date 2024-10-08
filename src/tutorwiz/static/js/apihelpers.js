// authInfo should be defined prior to loading this library

async function makeAPICall(endpoint, body, method, extraHeaders) {
	return await fetch(endpoint, {
		headers: {
			Authorization: `Bearer ${(await getAuthInfo()).accessToken}`,
			...extraHeaders
		},
		method,
		body
	})
}

async function getJSONInfoFromAPICall(endpoint, body, method, headers) {
	return await (await makeAPICall(endpoint, body, method, headers)).json()
}

function getUserInfo(userID) {
	if (!userID) return getJSONInfoFromAPICall("/api/get-self");

	return getJSONInfoFromAPICall(`/api/get-user?id=${userID}`);
}

function getThreadInfo(threadID) {
	return getJSONInfoFromAPICall(`/api/get-thread?id=${threadID}`);
}

function getChannelInfo(channelID) {
	return getJSONInfoFromAPICall(`/api/get-channel-info?id=${channelID}`);
}

function getMessageInfo(messageID) {
	return getJSONInfoFromAPICall(`/api/get-message?id=${messageID}`);
}

function updateUserInfo(qualIDs) {
	return getJSONInfoFromAPICall(`/api/update-user-roles?roles=${qualIDs.join(',')}`);
}

function getChannels() {
	return getJSONInfoFromAPICall(`/api/get-channels`);
}

function createThreadAPI(channel, title, description) {
	return getJSONInfoFromAPICall(`/api/create-thread`, JSON.stringify({
		channel, title, description
	}), "POST", {
		"Content-Type": "application/json"
	});
}

function sendMessageToServer(threadID, messageContent) {
	return getJSONInfoFromAPICall(`/api/send-message`, JSON.stringify({
		threadID,
		content: messageContent
	}), "POST", {
		"Content-Type": "application/json"
	});
}