import webpy

def handler(app: webpy.App, *args):
	from flask import request
	
	document = webpy.documentify("index.html")

	return document._stringify()
