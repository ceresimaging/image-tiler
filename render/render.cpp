#include <mapnik/map.hpp>
#include <mapnik/load_map.hpp>
#include <mapnik/agg_renderer.hpp>
#include <mapnik/image.hpp>
#include <mapnik/image_util.hpp>
#include <mapnik/datasource_cache.hpp>
#include <mapnik/font_engine_freetype.hpp>

int main(int argc, char** argv)
{
    using namespace mapnik;

    datasource_cache::instance().register_datasources("/usr/local/lib/mapnik/input/");
    freetype_engine::register_font("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf");
    
    Map m(atoi(argv[3]), atoi(argv[4]));
    load_map(m, argv[1]);
    m.zoom_all();
    image_rgba8 im(atoi(argv[3]), atoi(argv[4]));
    agg_renderer<image_rgba8> ren(m, im);
    ren.apply();
    save_to_file(im, argv[2]);
}

