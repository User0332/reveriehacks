import datetime
import secrets
import secret_keys
from sockioevents import socketio
from typing import TypeVar
from flask import Response, jsonify, request
from webpy import App
from propelauth_flask import current_user, init_auth
from propelauth_flask.user import LoggedInUser


current_user: LoggedInUser
auth = init_auth(secret_keys.AUTH_URL, secret_keys.AUTH_API_KEY)

app = App(__name__, template_folder="html")

def webpy_setup(app: App):
	# expose auth & db for API routes
	global auth
	global db

	# expose db models for API routes
	global User, Channel, MessageThread, Message

	# expose db util methods
	global query_by_id
	global query_all_of
	global ensure_user
	global gen_id

	# Init application, auth, socketio & db
	app.debug = True
	app.secret_key = secret_keys.APP_SECRET_KEY
	
	db = app.sqlalchemy.init("sqlite:///database.db")
	socketio.init_app(app)

	# Define database models

	class User(db.Model):
		__tablename__ = "user"
		id: str = db.Column(db.String, primary_key=True, unique=True, nullable=False)
		name: str = db.Column(db.String, unique=True, nullable=False)
		threads = db.relationship("MessageThread", backref=db.backref("author"), lazy=True)
		messages = db.relationship("Message", backref=db.backref("author"), lazy=True)
		authorized_channels_comma_sep: str = db.Column(db.String, nullable=False)
		
		# schedule

		@property
		def authorized_channels(self) -> list[str]:
			return list(
				filter(None, self.authorized_channels_comma_sep.split(','))
			)
			
		@authorized_channels.setter
		def authorized_channels(self, value: list[str]):
			self.authorized_channels_comma_sep = ','.join(value)

	class Channel(db.Model):
		__tablename__ = "channel"

		id: str = db.Column(db.String, primary_key=True, unique=True, nullable=False)
		name: str = db.Column(db.String, unique=True, nullable=False)
		threads = db.relationship("MessageThread", backref=db.backref("channel"), lazy=True)

	class MessageThread(db.Model):
		__tablename__ = "messagethread"

		id: str = db.Column(db.String, primary_key=True, unique=True, nullable=False)
		parent_channel_id: str = db.Column(db.String, db.ForeignKey("channel.id"), nullable=False)
		parent_user_id: str = db.Column(db.String, db.ForeignKey("user.id"), nullable=False)	
		messages = db.relationship("Message", backref=db.backref("thread"), lazy=True)

		title: str = db.Column(db.String, nullable=False)
		description: str = db.Column(db.String, nullable=False)

		# author: User
		# channel: Channel
		
	class Message(db.Model):
		__tablename__ = "message"

		id: str = db.Column(db.String, primary_key=True, unique=True, nullable=False)
		parent_thread_id: str = db.Column(db.String, db.ForeignKey("messagethread.id"), nullable=False)
		parent_user_id: str = db.Column(db.String, db.ForeignKey("user.id"), nullable=False)

		content: str = db.Column(db.String, nullable=False)
		timestamp: str = db.Column(db.String, nullable=False)

		# author: User
		# thread: MessageThread


	T = TypeVar('T')

	def query_by_id(model_type: type[T], model_id: str) -> T: #I think  this is a beautiful line of code
		return db.session.execute(
			db.select(model_type).where(model_type.id == model_id)
		).scalar()
	
	def query_all_of(model_type: type[T]) -> list[T]:
		return list(
				db.session.execute(
				db.select(model_type)
			).scalars().all()
		)
	
	def ensure_user() -> User:		
		user = query_by_id(User, current_user.user_id)

		if user is None:
			user = User(
				id=current_user.user_id,
				name=current_user.user.first_name,
				authorized_channels_comma_sep=""
			)

			db.session.add(user)

			db.session.commit()

			return user

		return user
	
	def gen_id():
		return secrets.token_urlsafe(10)+str(datetime.datetime.now().timestamp())

@app.route("/api/update-user-roles")
@auth.require_user
def update_roles():
	user = ensure_user()

	roles_str = request.args.get("roles")

	if roles_str is None: return Response(status=400)

	roles_list = list(filter(None, roles_str.split(',')))

	authorized_channels: list[str] = []

	for channel_id in roles_list:
		if not query_by_id(Channel, channel_id): return Response(status=400)

		authorized_channels.append(channel_id)

	user.authorized_channels = authorized_channels

	db.session.commit()

	return jsonify(authorized_channels)

@app.route("/api/create-thread" , methods=["POST"])
@auth.require_user
def create_thread():
	user = ensure_user()
	
	channel_id = request.json.get("channel")
	
	if query_by_id(Channel, channel_id) is None: return Response(status=400) # bad request

	title = request.json.get("title")
	description = request.json.get("description")

	if (not title) or (not description): return Response(status=400) # bad request

	new_thread = MessageThread(
		id=gen_id(),
		parent_channel_id=channel_id,
		parent_user_id=user.id,
		title=title,
		description=description
	)

	db.session.add(new_thread)
	db.session.commit()

	return jsonify(new_thread.id)


@app.route("/api/get-channels")
@auth.require_user
def get_channels():
	ensure_user()
	
	return jsonify({
		channel.id: channel.name
		for channel in query_all_of(Channel)
	})

@app.route("/api/get-channel-info")
@auth.require_user
def get_channel_info():
	ensure_user()

	channel = query_by_id(Channel, request.args.get("id"))

	if not channel: return Response(status=400)
	
	return jsonify({
		"name": channel.name,
		"threads": [thread.id for thread in channel.threads]
	})

@app.route("/get-threads")
@auth.require_user
def get_threads():
	ensure_user()

	channel_id = request.args.get("channelID")

	channel = query_by_id(Channel, channel_id)

	if channel is None: return Response(status=400) # bad request


	return jsonify(
		[thread.id for thread in channel.threads]
	)

@app.route("/api/get-message")
@auth.require_user
def get_message():
	ensure_user()
	
	message_id = request.args.get("id")

	message = query_by_id(Message, message_id)

	if message is None: return Response(status=400)

	return jsonify({
		"author": message.author.id,
		"content": message.content,
		"timestamp": message.timestamp
	})

@app.route("/api/get-thread")
@auth.require_user
def get_thread():
	ensure_user()
	
	thread_id = request.args.get("id")

	thread = query_by_id(MessageThread, thread_id)

	if thread is None: return Response(status=400)

	return jsonify({
		"author": thread.author.id,
		"channel": thread.channel.id,
		"description": thread.description,
		"title": thread.title,
		"messages": [message.id for message in thread.messages]
	})


@app.route("/api/get-self")
@auth.require_user
def get_self():
	user = ensure_user()
				
	return jsonify({
		"id": user.id, 
		"name": user.name,
		"threads": [thread.id for thread in user.threads], 
		"messages": [message.id for message in user.messages],
		"authorizedChannels": user.authorized_channels
	})


@app.route("/api/get-user")
@auth.require_user
def get_user():
	ensure_user()
	user_id = request.args.get("id")

	if not user_id: return Response(status=404)

	user = query_by_id(User, user_id)
 
	return jsonify({
		"id": user.id, 
		"name": user.name,
		"threads": [thread.id for thread in user.threads], 
		"messages": [message.id for message in user.messages],
		"authorizedChannels": user.authorized_channels
	})


@app.route("/api/send-message", methods=["POST"])
@auth.require_user
def send_message():
	user = ensure_user()

	content = request.json.get("content")
	thread_id = request.json.get("threadID")

	if (not content) or (not thread_id): return Response(status=400)

	thread = query_by_id(MessageThread, thread_id)

	if not thread: return Response(status=400)

	if (thread.author.id != user.id) and (thread.channel.id not in user.authorized_channels):
		return jsonify({ # user is not allowed to send message
			"status": "failure",
			"reason": "forbidden",
		})

	message = Message(
		id=gen_id(),
		content=content,
		timestamp=datetime.datetime.now().isoformat(),
		parent_thread_id=thread_id,
		parent_user_id=user.id
	)

	db.session.add(message)
	db.session.commit()

	socketio.emit("new-message", content)

	return jsonify({
		"status": "success",
		"reason": message.id
	})