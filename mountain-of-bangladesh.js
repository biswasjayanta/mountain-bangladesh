// Initialize the engine with a location and inject into page
const container = document.getElementById( 'container' );
const peakList = document.getElementById( 'peak-list' );
const peakListOverlay = document.getElementById( 'peak-list-overlay' );
const stencilOverlay = document.getElementById( 'stencil' );
const title = document.getElementById( 'title' );
const subtitle = document.getElementById( 'subtitle' );

const ELEVATION_APIKEY = import.meta.env.VITE_API_KEY; 

const datasource = {
  elevation: {
    // We will discuss OpenTopography integration below
    apiKey: ELEVATION_APIKEY 
  },
  imagery: {
    // Swapping to Esri World Topo for a global terrain basemap
    urlFormat: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; <a href="https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer">Esri</a>'
  }
}
Procedural.init( { container, datasource } );

const env = {
  title: 'monochrome',
  parameters: {
    turbidity: 7.6,
    reileigh: 0,
    mieCoefficient: 0.039,
    mieDirectionalG: 0.47,
    inclination: 0.53,
    azimuth: 0.375
  }
}

// Configure buttons for UI
Procedural.setCompassVisible( false );

// Define function for loading a given peak
function loadPeak( feature ) {
  const { name } = feature.properties;
  const [longitude, latitude] = feature.geometry.coordinates;
  Procedural.displayLocation( { latitude, longitude } );
  Procedural.setEnvironment( env );
  title.innerHTML = '<';
  title.classList.remove( 'hidden' );
  peakListOverlay.classList.add( 'hidden' );
  stencilOverlay.classList.remove( 'hidden' );

  const overlay = {
    "name": "peak",
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "geometry": feature.geometry,
        "properties": {
          "name": `${name}`,
          "background": "rgba(35,46,50,1)",
          "fontSize": 18,
          "padding": 10,
          "anchorOffset": { "y": 86, "x": 0 }
        }
      },
      {
        "type": "Feature",
        "geometry": feature.geometry,
        "properties": {
          "image": "_",
          "background": "rgba(255, 255, 255, 0.5)",
          "width": 0,
          "height": 30,
          "padding": 1,
          "anchor": "bottom",
          "anchorOffset": { "y": 39, "x": 0 }
        }
      }
    ]
  }

  Procedural.addOverlay( overlay );
  setTimeout( () => Procedural.orbitTarget(), 1000 );
}

// Show list when title clicked
title.addEventListener( 'click', () => {
  title.classList.add( 'hidden' );
  peakListOverlay.classList.remove( 'hidden' );
  stencilOverlay.classList.add( 'hidden' );
} );

fetch( 'mountain.geojson' ) 
  .then( data => data.json() )
  .then( locations => {
    
    // Display first location (e.g., somewhere in Sylhet)
    // Coordinates for Sylhet: Longitude 91.8687, Latitude 24.8949
    if (locations.features.length > 0) {
      const [longitude, latitude] = locations.features[ 0 ].geometry.coordinates;
      Procedural.displayLocation( { latitude, longitude } );
    } else {
      // Fallback location if GeoJSON is empty
      Procedural.displayLocation( { latitude: 24.8949, longitude: 91.8687 } );
    }
    locations.features.forEach( (peak, i) => {
    locations.features.forEach( (peak, i) => {
      const li = document.createElement( 'li' );
      let p = document.createElement( 'p' );
      p.innerHTML = peak.properties.name;
      li.appendChild( p );
      p = document.createElement( 'p' );
      peakList.appendChild( li );
      li.addEventListener( 'click', () => loadPeak( peak ) );
    } );
    peakListOverlay.classList.remove( 'hidden' );

    // Add GH link
    const li = document.createElement( 'li' );
    let p = document.createElement( 'p' );
    p.innerHTML = '[[ - Fork me on GitHub - ]]';
    li.appendChild( p );
    peakList.appendChild( li );
    li.addEventListener( 'click', () => {
      window.location = 'https://github.com/biswasjayanta/mountain-bangladesh/';
    } );

    // Add overlay showing all volcanoes
    const overlay = {
      "name": "dots",
      "type": "FeatureCollection",
      "features": locations.features.map( (feature, i) => ( {
        "id": i,
        "type": "Feature",
        "geometry": feature.geometry,
        "properties": {
          "name": "",
          "background": "rgba(255, 255, 255, 0.7)",
          "borderRadius": 16,
          "padding": 4,
        }
      } ) )
    }
    Procedural.addOverlay( overlay );

    // Move view to peak when marker clicked
    Procedural.onFeatureClicked = id => {
      const peak = locations.features[ id ];
      if ( peak ) { loadPeak( peak ) }
    }
  } );
