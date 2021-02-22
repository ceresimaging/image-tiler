# Ceres Imaging Tile Server

[![CircleCI](https://circleci.com/gh/ceresimaging/image-tiler.svg?style=svg)](https://circleci.com/api/v1.1/project/github/ceresimaging/image-tiler/latest/artifacts/0/coverage/index.html)

## How to make it work locally:

1. Configure variables: `cp .env.example .env`

2. Start Works PostgreSQL container (Tiler uses that DB)

3. Setup and run container: `docker-compose up`

4. Use it!

### Testing

`make tests`
