# ngrok Docker Desktop Extension

Use [ngrok](https://ngrok.com)'s API Gateway cloud service to forward traffic from internet-accessible endpoint URLs to your local Docker containers.

Go here if you're looking for the [ngrok Docker image](#docker-image).

## Installation

To install the extension:

1. Navigate to Docker Hub → [ngrok/ngrok-docker-extension](https://hub.docker.com/r/ngrok/ngrok-docker-extension)
2. In the Tag drop-down menu, select the extension version you wish to install. We recommend using the latest available version.
3. Click `Run in Docker Desktop`

## Quick start

After installing the extension:

1. The extension will prompt you to add your ngrok authtoken
2. Start an endpoint by clicking the `+` icon on the container you want to put online
3. Optionally specify a custom URL and [traffic policy](https://ngrok.com/docs/traffic-policy/).
4. You have an endpoint URL for your container that you can share!

## Screenshots
<img width="1292" alt="containers" src="./resources/screenshot.png">

## Development

See [AGENT.md](AGENT.md)

## Docker Image

Perfer a terminal over GUI? You're probably looking for the [ngrok Docker Image](https://hub.docker.com/r/ngrok/ngrok).

The docker image is suited for automation, scripting, and DevOps workflows. 

Links:
- [ngrok Docker Image on Dockerhub](https://hub.docker.com/r/ngrok/ngrok)
- [ngrok Docker Image on Github](https://github.com/ngrok/docker-ngrok)
