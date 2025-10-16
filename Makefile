.PHONY: help install dev test lint format clean build docker-build docker-run deploy

help:
	@echo "ProofBench 3.7.2 - Development Commands"
	@echo ""
	@echo "  make install        Install production dependencies"
	@echo "  make dev            Install development dependencies"
	@echo "  make test           Run test suite"
	@echo "  make lint           Run linters"
	@echo "  make format         Format code"
	@echo "  make clean          Clean build artifacts"
	@echo "  make build          Build production bundle"
	@echo "  make docker-build   Build Docker image"
	@echo "  make docker-run     Run Docker container"
	@echo "  make deploy         Deploy to production"

install:
	npm ci

dev:
	npm install
	pip install -e ".[dev]"

test:
	npm test
	pytest tests/

lint:
	npm run build
	ruff check python/
	mypy python/

format:
	npx prettier --write "src/**/*.{ts,tsx}"
	black python/
	ruff format python/

clean:
	rm -rf dist/
	rm -rf build/
	rm -rf node_modules/
	rm -rf coverage/
	rm -rf storybook-static/
	rm -rf *.egg-info/
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete

build:
	npm run build

docker-build:
	docker build -t proofbench:latest .

docker-run:
	docker-compose up -d

deploy:
	./scripts/deploy.sh production
