ENTRY = pan-and-zoom
UMD_NAME = PanAndZoom

all: lint umd test

# Convert ESM source to UMD
umd: $(ENTRY).js

$(ENTRY).js: $(ENTRY).mjs
	npx rollup \
		--format umd \
		--preferConst \
		--name $(UMD_NAME) \
		--input $(ENTRY).mjs \
		--file $@
	npx eslint \
		--global define \
		--no-ignore \
		--rule "multiline-ternary: 0" \
		--rule "indent: 0" \
		--fix $@
	sed -i.bak -e 's/^ *\("use strict";\)/	\1/' $@
	rm -f $@.bak


# Wipe generated build targets
clean:
	rm -f $(ENTRY).js

.PHONY: clean


# Check source for style and syntax errors
lint:
	npx eslint --ext mjs,js .

.PHONY: lint


# Run unit-tests
test: umd
	npx mocha

.PHONY: test
