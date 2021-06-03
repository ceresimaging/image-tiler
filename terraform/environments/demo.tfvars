environment = "dev"
name = "demo"
image_repo = "292290781350.dkr.ecr.us-west-2.amazonaws.com/tile-server"
image_tag = "demo"
desired_instances = 1
app_config = {
  CACHE_PATH = "/tiffs"
  CUSTOM_LAYERS_BUCKET = "ceres-custom-layers"
  CUSTOM_LAYERS_REGION = "us-west-2"
  CLOUDFRONT_DISTRIBUTION = "E1D7BZJKAOSULA"
  CORE_DB_HOST = "works-demo.cyla8ox7pgyv.us-west-2.rds.amazonaws.com"
  CORE_DB_NAME = "osiris_production"
  CORE_DB_PORT = 5432
  EXTRA_DB_HOST = "osiris-extra-tiles.cyla8ox7pgyv.us-west-2.rds.amazonaws.com"
  EXTRA_DB_PORT = 5432
  EXTRA_DB_NAME = "extra_layers"
  EXTRA_DB_TABLE = "gssurgo"
  HOST = "0.0.0.0"
  PORT = "80"
  IMAGERY_BUCKET = "ceres-geotiff-data"
  IMAGERY_REGION = "us-west-2"
  MAXAR_SATELLITE = "DigitalGlobe:ImageryTileService"
  MAXAR_URL = "https://access.maxar.com/earthservice/tmsaccess/tms/1.0.0"
  NODE_ENV = "production"
  PROXY_BASE_URL = "https://map-proxy.ceresimaging.net"
  REDIS_HOST = "wms-proxy-testing.vcd6xs.0001.usw2.cache.amazonaws.com"
  SUPPORT_USER = "0e614637-f89d-4fee-a92b-c6a56f01dbec"
  NEW_RELIC_ENABLED="true"
  NEW_RELIC_NO_CONFIG_FILE="true"
  NEW_RELIC_LOG_ENABLED="false"
  NEW_RELIC_APP_NAME="Tile Server (Demo)"
}