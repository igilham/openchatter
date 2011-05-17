from google.appengine.ext import db

class Comment(db.Model):
	user = db.UserProperty(auto_now_add=True)
	message = db.TextProperty(required=True)
	date = db.DateTimeProperty(required=True, auto_now_add=True)