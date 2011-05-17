import datetime
import logging
from Comment import Comment

from django.utils import simplejson as json # django json

from google.appengine.api import users
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext import db



class CommentsDelete(webapp.RequestHandler):
	#http://gregbaut.appspot.com/comments/delete/2023+3455+3466
	def get(self, ids, format):
		logging.debug("CommentsDelete Called")
		
		if not ids:
			self.response.set_status(400)
			return
		
		if not format == "json":
			# unsupported format
			self.response.set_status(400)
			return
		
		user = users.get_current_user()
		ids = ids.split("%2B")
		deletedComments = {'comments' :  []}
		
		logging.debug(ids)
		
		for index in ids:
			try:
				comment = Comment.get_by_id(int(index))
				
				if comment:
					if comment.user.user_id() == user.user_id():
						comment.delete()
						logging.debug("Comment ", index, " deleted")
						deletedComments['comments'].append({ 'commentID' : index, 'commentStatus' : 'deleted'})
					else:
						deletedComments['comments'].append({ 'commentID' : index, 'commentStatus' : 'notauthorised'})
				else:
					deletedComments['comments'].append({ 'commentID' : index, 'commentStatus': 'notfound'})
			
			except ValueError:
				logging.debug("Comment ", index, " could not be deleted. Check format.")
				deletedComments['comments'].append({ 'commentID' : index, 'commentStatus' : 'error'})


		out = json.dumps(deletedComments)
		
		if self.request.get("callback"):
			out = "%s(%s)" % (self.request.get("callback"), out)
		
		self.response.out.write(out)
		self.response.set_status(200)
		logging.debug("CommentsDelete End")

application = webapp.WSGIApplication([
									 ("/comments/delete/(.*)\.(.*)\??.*", CommentsDelete)],
									 debug=True)

def main():
	run_wsgi_app(application)

if __name__ == "__main__":
	main()