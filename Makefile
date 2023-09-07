.DEFAULT_GOAL:=server
server:
	make server-build && \
	make server-remove && \
	make server-start
server-build:
	docker build . -t arkis-cli
server-remove:
	docker rm -f arkis-cli-server
server-start:
	docker run --name arkis-cli-server -d -p 127.0.0.1:3000:3000/tcp arkis-cli
