build:
	npm test
.PHONY: build

install:
	yarn install
.PHONY: install

reportcoverage:
	rm -rf ./codecov
	curl -L -o ./codecov https://codecov.io/bash
	chmod +x ./codecov
	npm run coverage:report
.PHONY: reportcoverage

publish: build
	npm install -g npm-cli-login
	npm-cli-login
	yarn publish --access public
.PHONY: publish
