build:
	npm install @zlanguage/zstdlib@latest --save
	npm test
.PHONY: build

coverage: build
	npm run coverage:generate
.PHONY: coverage

publish: build
	npm publish --access public
.PHONY: publish
