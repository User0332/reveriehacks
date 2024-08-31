const authUrl = "https://8930990.propelauthtest.com";
const authClient = PropelAuth.createClient({ authUrl });
const getUserInfoRoute = "/api/get-self"
let authInfo;

async function getAuthInfo() {
	return await authClient.getAuthenticationInfoOrNull();
}

getAuthInfo().then((recievedInfo) => {
	authInfo = recievedInfo;

	if (!recievedInfo) location.href = authUrl;
});

async function execWithUserData(func) {
	const authInfo = await getAuthInfo();

	const res = await fetch(
		getUserInfoRoute, {
			"headers": {
				Authorization: `Bearer ${authInfo.accessToken}`
			}
		}
	);
	
	const userData = await res.json();

	func(userData)
}