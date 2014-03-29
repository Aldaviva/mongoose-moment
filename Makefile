MOCHA := node_modules/.bin/mocha

.PHONY: test
test:
	@$(MOCHA) --reporter spec --bail test