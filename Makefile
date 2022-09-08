.PHONY: setup clean test lint fmt

NAME := ytdl-best
ENTRY_POINT := src/mod.ts

ifeq ($(OS),Windows_NT)
	EXT = .exe
endif

.DEFAULT_GOAL: $(NAME)

${NAME}: clean setup
	deno compile --unstable --allow-run --output bin/${NAME}${EXT} ${ENTRY_POINT}
	deno compile --unstable --allow-run --output bin/${NAME}${EXT} --target x86_64-pc-windows-msvc ${ENTRY_POINT}

setup: clean
	git config --local core.hooksPath githooks
	mkdir bin

clean:
	rm -rf ./bin

test:
	deno test --coverage=./cov

coverage:
	deno coverage cov

lint:
	deno lint

fmt:
	deno fmt
