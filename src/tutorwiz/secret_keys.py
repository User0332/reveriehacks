with open("./instance/SECRET_KEYS", 'r') as f:
	APP_SECRET_KEY = f.readline()
	AUTH_URL = f.readline()
	AUTH_API_KEY = f.readline()