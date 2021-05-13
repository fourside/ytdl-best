NAME := ytdl-best
ENTRY_POINT := src/main.ts

ifeq ($(OS),Windows_NT)
	EXT = .exe
endif

.DEFAULT_GOAL: $(NAME)

${NAME}: clean setup lint test
	deno compile --unstable --allow-run --lite --output bin/${NAME}${EXT} ${ENTRY_POINT}
	deno compile --unstable --allow-run --lite --output bin/${NAME}${EXT} --target x86_64-pc-windows-msvc ${ENTRY_POINT}

setup: clean
	git config --local core.hooksPath githooks
	mkdir bin

clean:
	rm -rf ./bin

test:
	deno test

lint:
	deno lint --unstable

fmt:
	deno fmt

.PHONY: setup compile clean test lint fmt
