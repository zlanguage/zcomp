build:
	yarn test
.PHONY: build

install:
	yarn install
.PHONY: install

reportcoverage: build
	rm -rf ./codecov
	curl -L -o ./codecov https://codecov.io/bash
	chmod +x ./codecov
	bash -c "./codecov"
.PHONY: reportcoverage
