build:
	npm test
.PHONY: build

install:
	yarn install
  yarn lerna bootstrap
.PHONY: install

reportcoverage: build
	rm -rf ./codecov
	curl -L -o ./codecov https://codecov.io/bash
	chmod +x ./codecov
	./codecov
.PHONY: reportcoverage

publish: build
	npm install -g npm-cli-login
	npm-cli-login
	yarn publish --access public
.PHONY: publish
