var messageServer = "http://example.appspot.com";
// gregs testing instance is on gregbaut.appspot.com

$(function() {
	var loggedIn = false;
    
    /**
       * Parse dates in ISO8601 format
       * (from delete.me.uk/2005/03/iso8601.html)
       */ 
    Date.prototype.setISO8601 = function (string) {
        var regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" +
            "(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?" +
            "(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?";
        var d = string.match(new RegExp(regexp));

        var offset = 0;
        var date = new Date(d[1], 0, 1);

        if (d[3]) { date.setMonth(d[3] - 1); }
        if (d[5]) { date.setDate(d[5]); }
        if (d[7]) { date.setHours(d[7]); }
        if (d[8]) { date.setMinutes(d[8]); }
        if (d[10]) { date.setSeconds(d[10]); }
        if (d[12]) { date.setMilliseconds(Number("0." + d[12]) * 1000); }
        if (d[14]) {
            offset = (Number(d[16]) * 60) + Number(d[17]);
            offset *= ((d[15] == '-') ? 1 : -1);
        }

        offset -= date.getTimezoneOffset();
        time = (Number(date) + (offset * 60 * 1000));
        this.setTime(Number(time));
    }
    
    Date.prototype.toISO8601String = function (format, offset) {
        /* accepted values for the format [1-6]:
         1 Year:
           YYYY (eg 1997)
         2 Year and month:
           YYYY-MM (eg 1997-07)
         3 Complete date:
           YYYY-MM-DD (eg 1997-07-16)
         4 Complete date plus hours and minutes:
           YYYY-MM-DDThh:mmTZD (eg 1997-07-16T19:20+01:00)
         5 Complete date plus hours, minutes and seconds:
           YYYY-MM-DDThh:mm:ssTZD (eg 1997-07-16T19:20:30+01:00)
         6 Complete date plus hours, minutes, seconds and a decimal
           fraction of a second
           YYYY-MM-DDThh:mm:ss.sTZD (eg 1997-07-16T19:20:30.45+01:00)
        */
        if (!format) { var format = 6; }
        if (!offset) {
            var offset = 'Z';
            var date = this;
        } else {
            var d = offset.match(/([-+])([0-9]{2}):([0-9]{2})/);
            var offsetnum = (Number(d[2]) * 60) + Number(d[3]);
            offsetnum *= ((d[1] == '-') ? -1 : 1);
            var date = new Date(Number(Number(this) + (offsetnum * 60000)));
        }

        var zeropad = function (num) { return ((num < 10) ? '0' : '') + num; }

        var str = "";
        str += date.getUTCFullYear();
        if (format > 1) { str += "-" + zeropad(date.getUTCMonth() + 1); }
        if (format > 2) { str += "-" + zeropad(date.getUTCDate()); }
        if (format > 3) {
            str += "T" + zeropad(date.getUTCHours()) +
                   ":" + zeropad(date.getUTCMinutes());
        }
        if (format > 5) {
            var secs = Number(date.getUTCSeconds() + "." +
                       ((date.getUTCMilliseconds() < 100) ? '0' : '') +
                       zeropad(date.getUTCMilliseconds()));
            str += ":" + zeropad(secs);
        } else if (format > 4) { str += ":" + zeropad(date.getUTCSeconds()); }

        if (format > 3) { str += offset; }
        return str;
    }
    getUser();
	updateTopicStats();
     // On start up get the latest N posts and poll server every 
     getLatestNPosts(10);
     getLatestPosts();
    
     /**
        * Posting comments
        */
     $("#comment_form").submit(function() {
         var comment = $("#comment-input").val();
         
         if(comment) {             
             try {
				$("#comment-input").val('');
				$("#submit").attr("disabled", "true");
				
                 $.getJSON(messageServer + "/comment/create/?callback=?", 
                    {comment : comment}, 
                    function(json){
					});
					updateTopicStats();
             } catch(err) {
                 //console.log(err);
             }
         } else {
             alert("You need to enter a comment");
         }
         
         return false;  
         
     });
     
     
    // Date object to kepp the date of the newest post
     var newestDate;
     
     /**
        * Get the latest N posts from the server
        */
     function getLatestNPosts(number) {
         //console.log("Getting last " + number + " posts on page load");        
         $.getJSON(messageServer + "/comments/show.json?callback=?", {number : number},
             function(data){
				 var currentUser = $("#userName").text();
                 newestDate = getNewestDate(data);
                 $("#commentsListBox").setTemplateElement("comment-template");

					$("#commentsListBox").setParam("user", currentUser);

                 $("#commentsListBox").processTemplate(data, " ", false);
                 $("div.comment").slideDown("slow");
				 handleDeleteRequest();
				 hideRemoveButtons();
              });
     };
         
     
     /**
        * Gets the latest posts from the server every X seconds
        */ 
     function getLatestPosts() {
         setTimeout(
             function bar() {
                 //console.log(newestDate.toISO8601String());
                 $.getJSON(messageServer + "/comments/date.json?callback=?", 
                 {from : newestDate.toISO8601String()}, 
                     function(data) {
                        if(data.comments.length != 0) {
                            newestDate = getNewestDate(data);
						 	var currentUser = $("#userName").text();						
                            $("#commentsListBox").setTemplateElement("comment-template");

							$("#commentsListBox").setParam("user", currentUser);
							
                            $("#commentsListBox").processTemplate(data, " ", true);
                            $("div.comment").slideDown("slow");
                            $("#submit").removeAttr("disabled");
							handleDeleteRequest();
                        }
						hideRemoveButtons();
                     });
 
                 getLatestPosts();
             }, 
             5000);
     };
         
     /**
        * Takes the JSON of comments returned from the server and works out 
        * the most recent date
        */    
     function getNewestDate(json_data) {
         $.each(json_data.comments, function(i, comment){
             currentDate = new Date();
             currentDate.setISO8601(comment.timestamp);
 
             if(!newestDate) { // newestDate is not set
                 newestDate = currentDate;
             }
             else {
                     if(currentDate.getTime() > newestDate.getTime()) {
                       newestDate = currentDate;
                 }   
         }
 
        });         
        
        return newestDate;
     };
	
	// right column trends
	function updateTopicStats() {
		$("#topicListweek").load("perl/getjson2.cgi?api=/comments/date.json?offset=7");
		$("#topicListmonth").load("perl/getjson2.cgi?api=/comments/date.json?offset=30");
	}
	
	// get the current user id
	function getUser() {
		$.ajax({
			async: false,
		    cache: false,
		    data: {},
		    type: 'GET',
		    dataType: 'jsonp',
		    url: messageServer+"/user/?callback=?",
		    success: function(data) {
		         var nick = data.nickname;
				if (nick == "__ERROR__"){
					nick = "anonymous";	
					loggedIn = false;
				} 
				else {
					loggedIn = true;
				}

				$("#userName").empty().append(nick);


				var currentPage = document.location.href;
				if(loggedIn == true) {
					$("#loginLink").empty().append("Logout");
					$("#loginLink").attr("href", messageServer+"/logout?redirect=" + currentPage);
				}
				else {
					$("#comment-box").toggle();
					$("#loginLink").empty().append("Login");
					$("#loginLink").attr("href", messageServer+"/login?redirect=" + currentPage);
				}
		    },
		    error: function() {
		        console.log("error");
		    }
		});
	}
    
		function hideRemoveButtons() {
			var allComments = $(".comment");
			
			$.each(allComments, function(i, comment) {
				var currentUser = $("#userName").text();
				var commentUser = $(this).find(".user_name").text();
			
				if(currentUser != commentUser) {
					console.log("  users different");
					$(this).find(".action-delete").hide();
				}
				else{
					console.log("  users match");
					$(this).find(".action-delete").show();
				}
			});
		}

		function handleDeleteRequest() {
			$('.action-delete').click(function () {
				var commentID = $(this).attr("id");

				$.getJSON(messageServer + "/comments/delete/"+ commentID + ".json?callback=?", function(data) {
					//alert(data);
					$.each(data.comments, function(i, comment){
						var cID = comment.commentID;
						var cStatus = comment.commentStatus;
					
						// check status
						if(cStatus == "deleted") {
							$("#" + cID).slideUp("normal", function() { $(this).remove(); } );
						}
					});
				});
			});
		}
});

