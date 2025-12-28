# Hydration Codex Makefile
# ========================
# Use npm scripts for most tasks. This Makefile is for setup only.

.PHONY: help install submodules clean

help:
	@echo "Hydration Codex"
	@echo ""
	@echo "Setup:"
	@echo "  make install     Install dependencies"
	@echo "  make submodules  Initialize git submodules"
	@echo "  make clean       Clean build artifacts"
	@echo ""
	@echo "For all other tasks, use npm scripts:"
	@echo "  npm run synthesize:all"
	@echo "  npm run docs:build"
	@echo "  npm run typecheck"
	@echo ""
	@echo "See package.json for full list of scripts."

install:
	npm install

submodules:
	git submodule update --init --recursive

submodules-update:
	git submodule update --remote --merge

clean:
	rm -rf dist/
	rm -rf node_modules/.cache/
