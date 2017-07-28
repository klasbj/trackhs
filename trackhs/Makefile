
vpath %.jsx source
vpath %.css source

JS := public/deckbuilder.js
CSS := public/deckbuilder.css

.PHONY: all
all: trackhs $(JS) $(CSS)

.PHONY: static
static: $(JS) $(CSS)

public:
	@mkdir public

$(JS): public/%.js: %.jsx | public
	babel -o $@ $<

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

