
vpath %.jsx source
vpath %.css source

JSS := $(addprefix public/, react.js react-dom.js immutable.js system.js)
JS := public/deckbuilder.js
CSS := public/deckbuilder.css

.PHONY: all
all: trackhs static

.PHONY: static
static: $(JS) $(CSS) $(JSS)

public:
	@mkdir public

$(JS): public/%.js: %.jsx .babelrc | public
	babel -o $@ $<

public/react.js: $(NODE_PATH)/react/dist/react.js | public
	cp $< $@

public/react-dom.js: $(NODE_PATH)/react-dom/dist/react-dom.js | public
	cp $< $@

public/immutable.js: $(NODE_PATH)/immutable/dist/immutable.js | public
	cp $< $@

public/system.js: $(NODE_PATH)/systemjs/dist/system.js | public
	cp $< $@

$(CSS): public/%.css: %.css | public
	cp $< $@

.PHONY: trackhs
trackhs:
	dub build

.PHONY: run
run: | all
	./trackhs

.PHONY: clean
clean:
	@rm -f $(JS)
	@-rmdir public
	@rm -f trackhs

