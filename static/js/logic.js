//URL to fetch JSON data from
let quakeURL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

//read in GeoJSON, and pass the data to mapEarthquakes
d3.json(quakeURL, function(data) { createFeatures(data.features); });

function createFeatures(earthquakeData) {

    //add circleMarkers for each earthquake
    function pointToLayer(feature, latlng) {
        return L.circleMarker(latlng); 
    }
    //create pop-up data for each earthquake on the map
    function onEachFeature(feature,layer) {
        layer.bindPopup(`Location: <strong>${feature.properties.place}</strong><br>`+
        `Magnitude: ${feature.properties.mag}<br>`+
        `Coordinates: ${feature.geometry.coordinates[1]}, ${feature.geometry.coordinates[0]}<br>` +
        'Time:' + new Date(feature.properties.time));
    }

    //create styles for each earthquake marker
    function styleMarkers(feature) {
        return {
            fillColor: getMagProperties(feature.properties.mag)[0],
            radius: getMagProperties(feature.properties.mag)[1],
            stroke: true,
            color:'#000000',
            opacity: 1,
            fillOpacity:1,
            weight:1
          };
    }
    //create layer of all earthquake markers
    let earthquakes = L.geoJson(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: pointToLayer,
        style: styleMarkers
    });
    
    //pass markers to map layer
    createMap(earthquakes)
}

//create map layer in which to add earthquake data to
function createMap(earthquakes) {

    //setup background tile layer, and apply our quakeMap to it.
    let bgTiles = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>' +
                        'contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: API_KEY

    });

    //create our earthquake map, set its coordinates, and it to the 'map' div
    let quakeMap = L.map('map', {
        center: [40, -100],
        zoom: 5,
        layers: [bgTiles, earthquakes]
    });

    //create legend control
    let legend = L.control({position: 'bottomright'});

    //setup legend data 
    legend.onAdd = function () {
        //create div for legend
        let div = L.DomUtil.create('div', 'info legend');

        //create seismic activity and color scales
        let scales = [0, 1, 2, 3, 4, 5, 6, 7];
        let colors = ['#dcf5ff', '#e6c86e', '#64b964', '#508cd7',
                      '#d77355', '#55415f', '#646964', '#000000'];

        // add scales and colors to map legend
        for (var i = 0; i < scales.length; i++) {
            div.innerHTML +=
            "<i style='background: " + colors[i] + "'></i> " +
            scales[i] + (scales[i + 1] ? "&ndash;" + scales[i + 1] + "<br>" : "+");
        }

        return div;
    }
    //add legend to Map
    legend.addTo(quakeMap);
};

//returns an array of color and radius values
function getMagProperties(quakeMagnitude) {
    let color = '';

    switch(true) {
        case quakeMagnitude > 7:
            color = '#000000'
            break;
        case quakeMagnitude > 6:
            color = '#646964'
            break;            
        case quakeMagnitude > 5:
            color = '#55415f'
            break;
        case quakeMagnitude > 4:
            color = '#d77355'
            break;
        case quakeMagnitude > 3:
            color = '#508cd7'
            break;
        case quakeMagnitude > 2:
            color = '#64b964'
            break;
        case quakeMagnitude > 1:
            color = '#e6c86e'
            break;
        default:
            color = '#dcf5ff'
            break;
    }
    let radius = quakeMagnitude*5
    return [color, radius]
}