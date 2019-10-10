build:
	echo "## RUNNING PHASE BUILD ##"
	echo "Status: INSTALLDEPS : RUNNING"
	npm install
	echo "Status: INSTALLDEPS : DONE"
	echo "Status: BUILDING : "
	echo "Status: BUILDING : DONE"
	echo "Status: TESTING : "
	npm test
	echo "Status: TESTING : DONE"
	echo "## COMPLETED PHASE BUILD ##"
.PHONY: build

coverage: build
	echo "## RUNNING PHASE COVERAGE ##"
	echo "Status : CODECOVERAGE : "
	npm run coverage:generate
	echo "Status : CODECOVERAGE : DONE"
	echo "## COMPLETED PHASE COVERAGE ##"
.PHONY: coverage

publish: build
	echo "## BEGINNING PHASE PUBLISH ##"
	echo "Status: RegistryPush : "
	npm publish --access public
	echo "Status: RegistryPush : DONE"
.PHONY: publish
