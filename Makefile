all: pan-and-zoom.js

%.js: %.mjs
	@sed -e 's/export default/module.exports =/' $^ > $@

clean:; rm -f *.js
.PHONY: clean
