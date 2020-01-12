// create links to fetch geojson data of earthquakes and plate boundary
var earthquakesUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
var faultlineUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// create a function to scale the magnitdue
function markerSize(magnitude) {
    return magnitude * 2;
};

var earthquakeLayer = new L.LayerGroup()

// perform a GET request to the query URL: earthquakesUrl
d3.json(earthquakesUrl, function (geoJson) {
    // once we get a response, send the geoJson.features array of objects object to the createFeatures function
    
    L.geoJSON(geoJson.features, {
        // using the pointToLayer option to create a CircleMarker
        // By default simple markers are drawn for GeoJSON Points. We can alter this by passing a pointToLayer 
        // function in a GeoJSON options object when creating the GeoJSON layer
        pointToLayer: function (geoJsonPoint, latlng) {
            return L.circleMarker(latlng, {radius: markerSize(geoJsonPoint.properties.mag)});
        },

        style: function (geoJsonStyle) {
            return {
                fillColor: magColor(geoJsonStyle.properties.mag),
                fillOpacity: 0.7,
                weight: 0.1,
                color: 'black'
            }
        },

        onEachFeature: function (feature, layer) {
            // Giving each feature a pop-up with information pertinent to it
            layer.bindPopup(
                "<h5 style='text-align:center;'>" + new Date(feature.properties.time) +
                "</h5><hr><h5 style='text-align:center;'>" + feature.properties.title + "</h5>");
        }
    }).addTo(earthquakeLayer);
});

// create a layer group for faultlines
var plateLayer = new L.LayerGroup();

// perform a GET request to the query URL: platesUrl
d3.json(faultlineUrl, function (geoJson) {
    // once we get a response, send the geoJson.features array of objects object to the L.geoJSON method
    L.geoJSON(geoJson.features, {
        style: function (geoJsonFeature) {
            return {
                weight: 2,
                color: 'red'
            }
        },
    }).addTo(plateLayer);
});

// create a fuction to change color by magnitude
function magColor(mag) {
    return mag > 8 ? "#800026":
            mag > 7 ? "#bd0026":
            mag > 6 ? "#e31a1c":
            mag > 5 ? "#fc4e2a":
            mag > 4 ? "#fd8d3c":
            mag > 3 ? "#feb24c":
            mag > 2 ? "#fed976":
            mag > 1 ? "#ffeda0":
                      "#ffffcc";
};

// define a function to create the map
function createMap() {
    // Define satelitemap and darkmap layers
    var outdoors = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.outdoors",
        accessToken: API_KEY
    });

    var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.satellite",
        accessToken: API_KEY
    });

    var gray = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.light",
        accessToken: API_KEY
    });

    // define a baselayer object to hold our base layer objects
    var baseLayers = {
        "Satellite": satellite,  
        "Grayscale": gray,
        "Outdoors": outdoors
    };

    // define a overlay object to hold our overlay layer objects
    var overlays = {
        "Fault Lines": plateLayer,
        "Earthquakes": earthquakeLayer,
    };

    // initialize the map on the "map" div with a given center and zoom
    mymap = L.map('map', {
        center: [31.57853542647338,-99.580078125],
        zoom: 3,
        layers: [outdoors, earthquakeLayer]
    })

    // create the legend to show diffent colors corresponding to the level of magnitude
    L.control.layers(baseLayers, overlays,{
        collapsed: false
    }).addTo(mymap);
    
    var legend = L.control({position: "bottomright"});

    legend.onAdd = function(map) {
        var div = L.DomUtil.create("div", "info legend"),
            grades = [0, 1, 2, 3, 4, 5],
            labels =[];
            
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
            '<i style="background:' + magColor(grades[i]) + '"></i> ' +
            grades[i] + (grades[i+1] ? '&ndash;' + grades[i+1] + '<br>' : '+');
        }
        return div;
    };
    legend.addTo(mymap);
};

// call the create map function
createMap();