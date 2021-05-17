import mapnik from "mapnik";

// Load Mapnik datasource
mapnik.registerDatasource(`${mapnik.settings.paths.input_plugins}/ogr.input`);

// Add custom layer to map
export const customLayer = (req, res, next) => {
  const { map } = res.locals;
  const { custom } = req.params;

  // Create layer based on Shapefile
  const layer = new mapnik.Layer("custom");
  layer.datasource = new mapnik.Datasource({
    type: "ogr",
    file: `/vsizip/vsis3/${bucket}/${custom}.shp`,
    layer: custom,
  });

  map.add_layer(layer);

  next();
};
