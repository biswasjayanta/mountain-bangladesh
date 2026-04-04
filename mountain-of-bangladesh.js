// Initialize the engine with a location and inject into page
const container = document.getElementById( 'container' );
const peakList = document.getElementById( 'peak-list' );
const peakListOverlay = document.getElementById( 'peak-list-overlay' );
const stencilOverlay = document.getElementById( 'stencil' );
const title = document.getElementById( 'title' );
const subtitle = document.getElementById( 'subtitle' );

// Get a FREE key from https://cloud.maptiler.com/account/
// MapTiler provides both elevation + imagery that Procedural GL supports natively
const MAPTILER_APIKEY = 'XL7pq33CzA3lwocBF57x';

// Only check if the key is empty/falsy
if ( !MAPTILER_APIKEY ) {
  container.innerHTML = '<p style="color:white; padding:20px; font-family:sans-serif;">' +
    'API key missing. Get a free key from ' +
    '<a href="https://cloud.maptiler.com/account/" style="color:#4fc3f7;">MapTiler</a>' +
    ' and paste it into mountain-of-bangladesh.js</p>';
  throw Error( 'MapTiler API key missing' );
}

// Use the built-in MapTiler provider — handles both elevation and imagery
// Define custom URLs for elevation (terrain-rgb) and imagery (satellite)
const datasource = {
  elevation: {
    urlFormat: 'https://api.maptiler.com/tiles/terrain-rgb-v2/{z}/{x}/{y}.webp?key=XL7pq33CzA3lwocBF57x'
  },
  imagery: {
    urlFormat: 'https://api.maptiler.com/tiles/satellite-v2/{z}/{x}/{y}.jpg?key=XL7pq33CzA3lwocBF57x'
  }
};

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
  /*Procedural.setEnvironment( env );*/
  title.innerHTML = '&lt;';
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
          "name": name,
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

// Fetch peak list and populate UI
fetch( 'mountain.geojson' )
  .then( data => data.json() )
  .then( locations => {
    // Display first location
    if ( locations.features.length > 0 ) {
      const [longitude, latitude] = locations.features[ 0 ].geometry.coordinates;
      Procedural.displayLocation( { latitude, longitude } );
    } else {
      Procedural.displayLocation( { latitude: 24.8949, longitude: 91.8687 } );
    }

    // Populate peak list
    locations.features.forEach( ( peak, i ) => {
      const li = document.createElement( 'li' );
      let p = document.createElement( 'p' );
      p.innerHTML = peak.properties.name;
      li.appendChild( p );
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

    // Add overlay showing all peaks as dots
    const overlay = {
      "name": "dots",
      "type": "FeatureCollection",
      "features": locations.features.map( ( feature, i ) => ( {
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