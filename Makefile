# Hydration Codex Makefile
# ========================

.PHONY: help install clone extract test lint typecheck clean

# Default target
help:
	@echo "Hydration Codex - Living Documentation System"
	@echo ""
	@echo "Setup:"
	@echo "  make install      Install dependencies"
	@echo "  make clone        Clone all ecosystem repositories"
	@echo ""
	@echo "Extraction:"
	@echo "  make extract      Run full extraction (all layers)"
	@echo "  make extract-l1   Extract L1 (runtime) only"
	@echo "  make extract-l2   Extract L2 (SDK) only"
	@echo "  make extract-l3   Extract L3 (indexer) only"
	@echo "  make extract-l4   Extract L4 (UI) only"
	@echo ""
	@echo "Analysis:"
	@echo "  make synthesize   Run synthesis (cross-refs, OMNISCIENCE)"
	@echo "  make propose      Generate change proposals"
	@echo ""
	@echo "Development:"
	@echo "  make test         Run tests"
	@echo "  make lint         Run linter"
	@echo "  make typecheck    Run TypeScript type checker"
	@echo ""
	@echo "Maintenance:"
	@echo "  make update       Pull latest from all repos"
	@echo "  make clean        Clean build artifacts"

# ===========================================
# Setup
# ===========================================

install:
	npm install

clone:
	./scripts/clone-repos.sh

update:
	./scripts/update-repos.sh

# ===========================================
# Extraction
# ===========================================

REPOS_PATH ?= ./repos
OUTPUT_PATH ?= ./knowledge-base/raw

extract:
	REPOS_PATH=$(REPOS_PATH) OUTPUT_PATH=$(OUTPUT_PATH) npm run extract

extract-l1:
	REPO_PATH=$(REPOS_PATH)/hydration-node OUTPUT_PATH=$(OUTPUT_PATH)/runtime npm run extract:runtime

extract-l2:
	REPO_PATH=$(REPOS_PATH)/sdk OUTPUT_PATH=$(OUTPUT_PATH)/sdk npm run extract:sdk

extract-l3:
	REPO_PATH=$(REPOS_PATH)/indexer OUTPUT_PATH=$(OUTPUT_PATH)/indexer npm run extract:indexer

extract-l4:
	REPO_PATH=$(REPOS_PATH)/hydration-ui OUTPUT_PATH=$(OUTPUT_PATH)/ui npm run extract:ui

# Legacy bash extraction (fallback)
extract-bash:
	./scripts/run-all-extractions.sh

# ===========================================
# Analysis
# ===========================================

synthesize:
	npm run synthesize

propose:
	npm run propose

# Full pipeline: extract → synthesize → propose
pipeline: extract synthesize propose
	@echo "Pipeline complete. Check knowledge-base/proposals/"

# ===========================================
# Development
# ===========================================

test:
	npm test

test-run:
	npm run test:run

lint:
	npm run lint

typecheck:
	npm run typecheck

# ===========================================
# CI/CD
# ===========================================

ci: install typecheck test-run extract
	@echo "CI pipeline complete"

# ===========================================
# Maintenance
# ===========================================

clean:
	rm -rf dist/
	rm -rf node_modules/
	rm -rf knowledge-base/raw/*/extraction.json

clean-extractions:
	rm -rf knowledge-base/raw/*/

# ===========================================
# Docker (optional)
# ===========================================

docker-build:
	docker compose build

docker-extract:
	USE_DOCKER=true ./scripts/run-all-extractions.sh
