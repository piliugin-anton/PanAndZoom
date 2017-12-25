BASE := /home/projects/pan-and-zoom
WWW  := /var/www/htdocs

all:
	@cp $(BASE)/pan-and-zoom.js $(BASE)/test/browser.js $(WWW)
	@cp $(BASE)/test/browser.html $(WWW)/index.html

.PHONY: all
