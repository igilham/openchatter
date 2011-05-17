from google.appengine.api import users
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext import db

class LoginHandler(webapp.RequestHandler):
	def get(self):
		referer = self.request.get("redirect") #self.request.headers["Referer"]
		if not referer:
			self.response.set_status(403)
			return
		
		self.redirect(users.create_login_url(referer))

class LogoutHandler(webapp.RequestHandler):
	def get(self):
		referer = self.request.get("redirect") #self.request.headers["Referer"]
		if not referer:
			self.response.set_status(403)
			return
		
		self.redirect(users.create_logout_url(referer))

class UserHandler(webapp.RequestHandler):
	def get(self):
		currentUser = users.get_current_user()
		if not currentUser:
			out = "{\"nickname\":\"__ERROR__\"}"
		else:
			out = "{\"nickname\":\"" + currentUser.nickname() + "\"}"
			
		if self.request.get("callback"):
			out = "%s(%s)" % (self.request.get("callback"), out)
		
		self.response.out.write(out)

application = webapp.WSGIApplication([
									 ("/login.*", LoginHandler),
									("/logout.*", LogoutHandler),
									("/user.*", UserHandler)],
									 debug=True)

def main():
	run_wsgi_app(application)

if __name__ == "__main__":
	main()