import mapnik from "mapnik";
import fs from "fs";

// Load Mapnik datasource
mapnik.registerDatasource(`${mapnik.settings.paths.input_plugins}/gdal.input`);

// Read stylesheet file
const style = fs.readFileSync("styles/imagery.xml", "utf8");

// Add imagery raster layer to map
export const imageryLayer = (req, res, next) => {
  const { map, path } = res.locals;

  map.fromStringSync(style);

  // Create layer based on imagery Geotiff file
  const layer = new mapnik.Layer("imagery");
  layer.datasource = new mapnik.Datasource({
    type: "gdal",
    file: path,
  });
  layer.styles = ["imagery"];

  map.add_layer(layer);

  next();
};
