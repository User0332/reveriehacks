import os
import app

app.webpy_setup(app.app)

db = app.db
Channel = app.Channel
Thread  = app.MessageThread

default_channels = [
	"Math",
	"Science",
	"English",
	"History" ,
	"Language",
	"Misc"
]

with app.app.app_context():
	os.remove("instance/database.db")
	db.create_all()

	for default_channel in default_channels:
		db_channel = Channel(id=app.gen_id(), name=default_channel)
		db.session.add(db_channel)

	db.session.commit()