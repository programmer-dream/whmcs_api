const generateRandomString = () => {
	return String.fromCharCode(97 + Math.floor(Math.random() * 26)) + Math.random().toString(36).substring(1, 8).toLowerCase().replace(/[\*\^\'\!\.]/g, '').split(' ').join('-');
};

module.exports = generateRandomString;