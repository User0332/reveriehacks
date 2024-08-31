function elem(tag, innerHTML) {
	const elem = document.createElement(tag);

	elem.innerHTML = innerHTML;

	return elem;
}

function textElem(tag, text) {
	const elem = document.createElement(tag);

	elem.textContent = text;

	return elem;
}