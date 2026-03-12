FROM node:25-slim AS node

# Inside the container, create an app directory and switch into it
RUN mkdir /app
WORKDIR /app

COPY ./package.json package.json
RUN npm install

FROM python:3.14.3 AS app

LABEL maintainer "DataMade <info@datamade.us>"

RUN apt-get update && \
	apt-get install -y --no-install-recommends --purge postgresql-client gdal-bin && \
	apt-get autoclean && \
	rm -rf /var/lib/apt/lists/* && \
	rm -rf /tmp/*

RUN mkdir /app
WORKDIR /app

COPY ./requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Get NodeJS & npm
COPY --from=node /usr/local/bin /usr/local/bin
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules

# Get app dependencies
COPY --from=node /app/node_modules /app/node_modules

COPY . /app
