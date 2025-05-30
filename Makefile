tailwind:
	./bin/tailwindcss -i ./css/input.css -o ./css/output.css --minify

live/tailwind:
	./bin/tailwindcss -i ./css/input.css -o ./css/output.css --minify --watch

serve:
	python3 -m http.server

.PHONY: tailwind live/tailwind serve