
vpath %.jsx source

JS := public/deckbuilder.js

.PHONY: all
all: trackhs $(JS)

public:
	@mkdir public

$(JS): public/%.js: %.jsx | public
	babel -o $@ $<

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

