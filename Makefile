build:
	npm run build
.PHONY: build

test: build
	npm run test
.PHONY: test

install:
	npm i
.PHONY: install

codecov: test
	rm -rf ./codecov
	curl -L -o ./codecov https://codecov.io/bash
	chmod +x ./codecov
	./codecov
.PHONY: reportcoverage

publish: test
	npm install -g npm-cli-login
	npm-cli-login
	npm publish --access public
.PHONY: publish
