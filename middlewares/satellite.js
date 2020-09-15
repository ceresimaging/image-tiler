import mapnik from 'mapnik';
import fs from 'fs';

// Load Mapnik datasource
mapnik.registerDatasource(`${mapnik.settings.paths.input_plugins}/gdal.input`);

// Read stylesheet files
const satelliteStyle = fs.readFileSync('styles/satellite.xml', 'utf8');

// Offline mode
const offline = process.env.NODE_ENV === 'test' && !process.env.REFRESH_FIXTURES;

const config = {
  wms: `<GDAL_WMS>
          <Service name="WMS">
            <ServerUrl>${process.env.PROXY_BASE_URL}/wms</ServerUrl>
            <Layers>satellite</Layers>
            <CRS>EPSG:3857</CRS>
            <Version>1.3.0</Version>
            <ImageFormat>image/png</ImageFormat>
          </Service>
          <DataWindow>
            <UpperLeftX>-20037508.34278924</UpperLeftX>
            <UpperLeftY>20037508.34278924</UpperLeftY>
            <LowerRightX>20037508.34278924</LowerRightX>
            <LowerRightY>-20037508.34278924</LowerRightY>
            <TileLevel>20</TileLevel>
            <TileCountX>1</TileCountX>
            <TileCountY>1</TileCountY>
          </DataWindow>
          <MaxConnections>20</MaxConnections>
          <Cache>
            <Path>${process.env.CACHE_PATH}/gdal</Path>
            <Depth>0</Depth>
          </Cache>
          <OfflineMode>${offline}</OfflineMode>
        </GDAL_WMS>`,
  tms: `<GDAL_WMS>
          <Service name="TMS">
            <ServerUrl>${process.env.PROXY_BASE_URL}/tiles/satellite/EPSG3857/\${z}/\${x}/\${y}.png</ServerUrl>
          </Service>
          <DataWindow>
            <UpperLeftX>-20037508.34278924</UpperLeftX>
            <UpperLeftY>20037508.34278924</UpperLeftY>
            <LowerRightX>20037508.34278924</LowerRightX>
            <LowerRightY>-20037508.34278924</LowerRightY>
            <TileLevel>18</TileLevel>
            <TileCountX>1</TileCountX>
            <TileCountY>1</TileCountY>
            <YOrigin>bottom</YOrigin>
          </DataWindow>
          <BlockSizeX>256</BlockSizeX>
          <BlockSizeY>256</BlockSizeY>
          <Projection>EPSG:3857</Projection>
          <MaxConnections>20</MaxConnections>
          <Cache>
            <Path>${process.env.CACHE_PATH}/gdal</Path>
            <Depth>0</Depth>
          </Cache>
          <OfflineMode>${offline}</OfflineMode>
        </GDAL_WMS>`,
  wmts: `<GDAL_WMTS>
          <GetCapabilitiesUrl>${process.env.PROXY_BASE_URL}/service?REQUEST=GetCapabilities&amp;SERVICE=WMTS</GetCapabilitiesUrl>
          <Layer>satellite</Layer>
          <TileMatrixSet>webmercator</TileMatrixSet>
          <Style>default</Style>
          <Format>image/png</Format>
          <DataWindow>
            <UpperLeftX>-20037508.34278924</UpperLeftX>
            <UpperLeftY>20037508.34278924</UpperLeftY>
            <LowerRightX>20037508.34278924</LowerRightX>
            <LowerRightY>-20037508.34278924</LowerRightY>
          </DataWindow>
          <MaxConnections>20</MaxConnections>
          <BandsCount>4</BandsCount>
          <Cache>
            <Path>${process.env.CACHE_PATH}/gdal</Path>
            <Depth>0</Depth>
          </Cache>
          <OfflineMode>${offline}</OfflineMode>
        </GDAL_WMTS>`
};

// Write config file
const filePath = `${process.env.CACHE_PATH}/satellite.xml`;
fs.writeFileSync(filePath, config.tms);

export const satelliteLayer = (req, res, next) => {
  const { map } = res.locals;

  map.fromStringSync(satelliteStyle);

  // Create satellite layer
  const satelliteLayer = new mapnik.Layer('satellite', '+init=epsg:3857');
  satelliteLayer.datasource = new mapnik.Datasource({
    type: 'gdal',
    file: filePath
  });
  satelliteLayer.styles = ['satellite'];

  map.add_layer(satelliteLayer);

  next();
};
