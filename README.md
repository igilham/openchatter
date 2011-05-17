OpenChatter
===========

Copyright 2011 Ian Gilham, Liam Dean, William Lord, Greg Bautyonok, Mark Preston

OpenChatter is a simple message board loosely inspired by Twitter.

OpenChatter was built at university as an experiment in getting 
disparate systems in various scripting languages to work together 
from either side of the university firewall.

The core technologies are a Javascript based web client and a Python 
server running on the Google App-Engine. A simple hash-tag feature was 
implemented later in Perl as a seperate component called via CGI.

Python App
----------

The Python App runs on the App-Engine and includes the main message 
database as well as user authentication and the core message API.

Authenticated users have the right to post new messages and delete their
own posts. There is essentially no moderation.

Perl Script
-----------

The Perl script simply mirrors the API of the Python App and searches for 
hash-tags (#tag) in the returned messages. These are then ordered by 
popularity and returned to the client.

This is perhaps the simplest form of tagging we could include without and 
a pretty cool way to extend an application without touching any of its code.

Web Client
----------

The web client consists of a simple web page and some Javascript, which 
calls functions on the Python and Perl apps, posts messages, and updates
the message display in the browser. Message passing is done using JQuery's 
AJAX functionality.

