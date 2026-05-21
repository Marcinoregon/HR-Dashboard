FROM python:3.12-alpine
WORKDIR /app
COPY . /app
EXPOSE 8080
CMD ["sh", "-c", "python3 -m http.server ${PORT:-8080}"]

