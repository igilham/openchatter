import datetime
import logging
from Comment import Comment

from google.appengine.ext import webapp
from google.appengine.ext import db
from django.utils import simplejson as json
from google.appengine.ext.webapp.util import run_wsgi_app

class CommentCreate(webapp.RequestHandler):
    # Have to use 'get' requests for this, because browsers do not allow cross domain 'post's
    # It seems a bit counter intuitive but it works nevertheless
    def get(self):
        logging.debug("CommentsCreate Called")
        comment = self.request.get('comment')
        
        if not comment:
			self.response.set_status(400)
			logging.debug("Attempted to create an empty comment. Error 400.")
			return
        
        # save the comment
        commentObj = Comment()
        commentObj.content = comment
        
        # Get current date and time
        timeNow = datetime.datetime.now()
        
        # Replace microseconds (has 6 digits) with rounded microseconds (has 3 digits) and padded with 3 zeros.
        # So if the microsecods were 123456, the value we are storing in the database is 123000
        # That is done to comply with the way google app engine stores datatime object, but more importanly
        # Data object in JavaScript(Client side) has only 3 places reserved for microseconds.
        commentObj.date =  timeNow.replace(microsecond=int(round(timeNow.microsecond/1000)*1000))
        commentObj.put()
        
        logging.debug("CommentsCreate End")

application = webapp.WSGIApplication([
									 ('/comment/create.*', CommentCreate)],
									 debug=True)

def main():
	run_wsgi_app(application)

if __name__ == "__main__":
	main()