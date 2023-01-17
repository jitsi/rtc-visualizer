# RTC Visualizer

This project contains the server & client used to visualize data from RTC stats server.


## Structure

The server side is using `express` and is located in `/src/server`.
The client uses React and is located in `/src/client`.

Client is build in `/public` where all the static files reside. This is also the default static dir for the server.


## Development

### Create a local dynamoDB instance

https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.DownloadingAndRunning.html

Load mock data from [/scripts/misc/items.json](scripts/misc/items.json).

!!! Links to `dumpId` could be expired (resulting in 404s when trying to fetch) so feel free to update it.

```sh
npm run create-local-db
```

### Install dependencies

```
npm ci
```

### Start the server in debugging mode:

```sh
npm run debug-server
```

### Build the js/html files & start watching files:
```sh
npm run watch-client
```

The app will run on http://localhost:8087.


## Deploying

### Prerequisites

Have access to the cluster (check out REPOSITORY_URL from [scripts/deploy](scripts/deploy.sh))

### Build docker image and push it

```sh
npm run deploy
```

This will build the client, create a tag, create a docker image and push it to repository.

## Acknowledgements

We use a customized version of [webrtc-internal-dumps](https://github.com/fippo/webrtc-dump-importer/) for plotting the client stats, which uses the Highcharts JS lib.  Note that the (awesome) Highcharts library used for plots may need a license. See http://shop.highsoft.com/
