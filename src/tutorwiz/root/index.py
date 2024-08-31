import webpy

def handler(app: webpy.App, *args):
	from flask import redirect
	
	return redirect("/self-profile")
