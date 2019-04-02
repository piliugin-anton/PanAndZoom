ENTRY = pan-and-zoom
UMD_NAME = PanAndZoom

all: umd

# Convert ESM source to UMD
umd: $(ENTRY).js

$(ENTRY).js: $(ENTRY).mjs
	npx rollup \
		--format umd \
		--preferConst \
		--name $(UMD_NAME) \
		--input $(ENTRY).mjs \
		--file $@


# Wipe generated build targets
clean:; rm -f *.js
.PHONY: clean
