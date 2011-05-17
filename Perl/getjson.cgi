#!/usr/bin/perl -w
# $Author: Liam Dean $

use strict;
use WWW::Mechanize;
use JSON -support_by_pp;
use CGI;
my $query = new CGI;
my $value = $query->param('api');

my %wordcount = ();


my $python_host = "http://example.appspot.com";
print "Content-type: text/html\n\n";
fetch_json_page($python_host . $value); #take python request from URL i.e. ?api=...

sub fetch_json_page
{
  my ($json_url) = @_;
  my $browser = WWW::Mechanize->new();
  eval{
    # download the json page from Google App Engine:
    $browser->get( $json_url );
    my $content = $browser->content();
    my $json = new JSON;
 
    my $json_text = $json->allow_nonref->utf8->relaxed->escape_slash->loose->allow_singlequote->allow_barekey->decode($content);
 
    # iterate over each blog in the JSON structure:

    foreach my $comments(@{$json_text->{comments}}){
      my %comments_hash = ();
      $comments_hash{comment} = $comments->{text};
	  $comments_hash{comment} =~s/^\s+|\s+$//g; #remove whitespace from beginning and end of comments
	  countwords($comments_hash{comment});

    }
	tallytable();
  };
  # catch crashes:
  if($@){
    print "<p>Bad Request</p>\n";
  }
}

sub countwords
{
	my $comment = $_[0];
	$/ = ""; # paragraph mode on

		#tr/A-Z/a-z/; # Convert to lower case.
		my $char = "#";
		my @words = split(/\s/, $comment);	# split into words
		foreach my $word (@words) {
			if(index($word, $char) == 0){
				$word =~s/[#]//g;
				$wordcount{$word}++; # count the words
			}
		}
}

sub tallytable
{
	# print out the totals sorted in numerical order
	my $count = 0;
	print "<ol>\n";
    foreach my $word (sort { $wordcount{$b} <=> $wordcount{$a} } keys %wordcount) {
		 #print "<tr>\n";
		 #print "<td>" . $wordcount{$word} . "</td>\n";
		 print "<li><span class=\"topic\">" . $word . "</span> x " . $wordcount{$word} . "</li>\n";
		 #print "</tr>\n";
		 $count++;
		 if($count >= 10){last;} # only print out up to ten words
	}
	print "</ol>\n";
}


