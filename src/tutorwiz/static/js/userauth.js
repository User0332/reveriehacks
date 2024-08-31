const authUrl = "https://8930990.propelauthtest.com";
const authClient = PropelAuth.createClient({ authUrl });
const getUserInfoRoute = "/api/getuserinfo"
let authInfo;

async function getAuthInfo() {
	return await authClient.getAuthenticationInfoOrNull();
}

(async () => { // onload
	authInfo = await getAuthInfo();
	if (!authInfo) location.href = authUrl;
})()

function execWithUserData(func) {
	while (!authInfo);

	fetch(
		getUserInfoRoute, {
			"headers": {
				Authorization: `Bearer ${authInfo.accessToken}`
			}
		}
	).then(
		res => res.json()
	).then(
		userData => {
			func(userData)
		}
	)
}