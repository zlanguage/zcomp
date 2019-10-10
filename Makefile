build:
	npm test
.PHONY: build

coverage: build
	npm run coverage:generate
.PHONY: coverage

publish: build
	npm publish --access public
.PHONY: publish

install:
  npm install
.PHONY: install
