import mapnik from "mapnik";

// Load Mapnik datasource
mapnik.registerDatasource(`${mapnik.settings.paths.input_plugins}/ogr.input`);

// Add custom layer to map
export const customLayer = (req, res, next) => {
  const { map } = res.locals;
  const { custom } = req.params;
  const { bucket } = req.query;

  // Create layer based on Shapefile
  const layer = new mapnik.Layer("custom");
  layer.datasource = new mapnik.Datasource({
    type: "ogr",
    file:
      process.env.NODE_ENV !== "test"
        ? `/vsizip/{/vsis3/${bucket}/${custom}}/${custom}.shp`
        : `/vsizip/{${process.cwd()}/test/fixtures/${bucket}/${custom}}/${custom}.shp`,
    layer: custom,
  });

  map.add_layer(layer);

  next();
};
