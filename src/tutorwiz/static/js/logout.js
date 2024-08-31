function confirmLogout() {
	authClient.logout().then(() => {
		location.href = authUrl;
	});
}

function cancelLogout() {
	window.location.href = '/';
}