MOCHA := node_modules/.bin/mocha

.PHONY: test
test:
	@$(MOCHA) --reporter spec --bail test

.PHONY: test-debug
test-debug:
	# you can debug tests with Blink Developer Tools using https://github.com/node-inspector/node-inspector and `make test-debug`
	@node-debug --web-port 8096 --cli --web-host 0.0.0.0 node_modules/.bin/_mocha --no-timeouts --reporter spec --bail test
