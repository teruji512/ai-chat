include .env

.PHONY: install dev build start lint clean deploy

install:
	npm install

dev:
	npm run dev

build:
	npm run build

start:
	npm run start

lint:
	npm run lint

clean:
	rm -rf .next node_modules

deploy:
	npm run build && npx vercel --prod
