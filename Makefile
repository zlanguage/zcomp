build:
	npm install
	npm test
.PHONY: build

coverage: build
	npm run coverage:generate
.PHONY: coverage

publish: build
	npm publish --access public
.PHONY: publish
