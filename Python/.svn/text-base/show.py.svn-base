import datetime
import logging
from Comment import Comment

from django.utils import simplejson as json # django json

from google.appengine.api import users
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext import db


# gt() function is needed to create datatime objects from ISO8601 formated date/time strings
# Depending on how microseconds are returned it will pad the value with zeros to comply with
# google's datastore.
def parseISO8601DateTime(dt_str):
	# dt, _, us= dt_str.partition(".")
	# dt = datetime.datetime.strptime(dt, "%Y-%m-%dT%H:%M:%S")
	# us = int(us.rstrip("Z"), 10)
	# numOfDigits = len(str(us))
	
	dateTime = dt_str.split(".")
	date = dateTime[0]
	microSeconds = dateTime[1]
	date = datetime.datetime.strptime(date, "%Y-%m-%dT%H:%M:%S")
	microSeconds = int(microSeconds.rstrip("Z"), 10)
	numOfDigits = len(str(microSeconds))
	
	# Pad the microseconds with zeros
	# if we got from the client is 2009-12-08T20:30:54.3, we will have to padd microseconds with 5 zeros,
	# if it is 2009-12-08T20:30:54.32, the microseconds will be padded with 4 zeros etc.
	if numOfDigits == 1:
		microSeconds = microSeconds * 100000
	elif numOfDigits == 2:
		microSeconds = microSeconds * 10000
	elif numOfDigits == 3:
		microSeconds = microSeconds * 1000
	
	return date + datetime.timedelta(microseconds=microSeconds)

def getCommentsSinceDate(date):
	# Gets all comments posted since that last date
	# Note that parseISO8601DateTime() function is called. See comments for parseISO8601DateTime() for explanation
	comments = None
	try:
		comments = db.GqlQuery("SELECT * FROM Comment WHERE date > :1 ORDER BY date DESC", date)
	except (IndexError, OverflowError):
		logging.debug("Incorrect timestamp format")
	
	return comments

def serialiseJSON(comments):
	commentDict = {'comments' : []}
	for comment in comments:
		currentDate = comment.date
		timestamp =currentDate.strftime("%Y-%m-%dT%H:%M:%S.") + str(int(round(currentDate.microsecond/1000)))
		commentDict['comments'].append({'uuid': comment.key().id(), 'user': comment.user.nickname(), 'text' : comment.content, 'date': currentDate.strftime("%Y-%m-%d %H:%M"),'timestamp' :  timestamp})
	
	return json.dumps(commentDict)
	

# get a single comment (acts as permalink)
class CommentShow(webapp.RequestHandler):
	def get(self, id, format):
		logging.debug("CommentShow Called")
		logging.debug("id = ", id)
		logging.debug("format = ", format)
		
		number = self.request.get("number")
		
		if not number:
			number = 20
		else:
			number = int(number)
		
		if number > (2**32)-1:
			logging.debug("Number out of range")
			self.response.set_status(406)
			return
		
		if id:
			logging.debug("id=", id)
			id = id.lstrip("/")
			id = int(id)
		
		comments = None
		
		if not format == "json":
			# 406 Not Acceptable
			self.response.set_status(406)
			self.response.out.write("Format is not supported. Use json.")
			return
		
		#comment = Comment.all().filter("id =", id).get()
		if id:
			comments = [Comment.get_by_id(id)]
		else:
			comments = Comment.all().order("-date").fetch(number)
		
		if not comments:
			logging.debug("Comment Not Found")
			self.response.set_status(404)
			return
		
		out = serialiseJSON(comments)
		
		jsonp = self.request.get('callback', '')
		if jsonp:
			out = '%s(%s)' % (jsonp, out)
		
		self.response.out.write(out)
		logging.debug("CommentShow End")


class CommentsDateHandler(webapp.RequestHandler):
	def fromOffset(self, offset):
		logging.debug("CommentsDateOffset Called")

		if not offset:
			self.response.set_status(400)
			return
		try:
			offset = int(offset)
		except ValueError:
			# value not an int
			self.response.set_status(400)
			return
		
		if offset > (2**32) - 1:
			# value out of range
			self.response.set_status(400)
			return
		
		try:
			date = datetime.datetime.now() - datetime.timedelta(days=offset)
			out = getCommentsSinceDate(date)
			out = serialiseJSON(out)
		except (ValueError, OverflowError, IndexError):
			self.response.set_status(400)
			return
		
		jsonp = self.request.get('callback')
		if jsonp:
			out = '%s(%s)' % (jsonp, out)
		
		self.response.out.write(out)
		logging.debug("CommentsDateOffset End")
	
	def fromDate(self, lastPostTimestamp):
		logging.debug("CommentsDate Start")
		# Will be in ISO8601 format e.g. 2009-12-08T20:30:54.3

		# Check date is in ISO8601 format
		if not lastPostTimestamp:
			self.response.set_status(400)
			logging.debug("Timestamp is empty")
			return
		
		try:
			date = parseISO8601DateTime(lastPostTimestamp)
			out = getCommentsSinceDate(date)
			out = serialiseJSON(out)
		except (ValueError, OverflowError, IndexError):
			self.response.set_status(400)
			return
		
		jsonp = self.request.get('callback')
		if jsonp:
			out = '%s(%s)' % (jsonp, out)
		
		self.response.out.write(out)
		logging.debug("CommentsDate End")

	def get(self, format):
		if not format:
			self.response.set_status(400)
			return
	
		offset = self.request.get("offset")
	
		if offset:
			self.fromOffset(offset)
		else :
			fromD = self.request.get("from")
	
			if fromD:
				self.fromDate(fromD)
			else:
				self.response.set_status(400)	
	
		return

#http://gregbaut.appspot.com/getcommentbydate/?callback=jsonp1263037800113&_=1263037805171&lastPostTimestamp=2010-01-08T22%3A58%3A20.354Z

application = webapp.WSGIApplication([
									 ("/comments/show(/.+)?\.(.+)\??.*", CommentShow),
									 ("/comments/date\.(.+).*", CommentsDateHandler)],
									 #("/comments/date\.(.+)\?from\=(.*)", CommentsFromDate),
									 #("/comments/date\.(.+)\?offset\=(.*)", CommentsDateOffset)],
									 debug=True)

def main():
	run_wsgi_app(application)

if __name__ == "__main__":
	main()