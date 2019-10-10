build:
	npm test
.PHONY: build

install:
	npm install
.PHONY: install

reportcoverage:
	rm -rf ./codecov
	curl -L -o ./codecov https://codecov.io/bash
	chmod +x ./codecov
	npm run coverage:report
.PHONY: reportcoverage

coverage: build
	npm run coverage:generate
.PHONY: coverage

publish: build
	npm install -g npm-cli-login
	npm-cli-login
	npm publish --access public
.PHONY: publish
