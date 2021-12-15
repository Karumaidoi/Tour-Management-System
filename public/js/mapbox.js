export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1Ijoia2FydW1haWRvIiwiYSI6ImNrcm4yZWl0cDFwOTIydnJ2Ymk1MDFyZDMifQ.K-ygLRCoFAo3hl9GlBas0g';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    scrollZoom: false,
    //   center: [-118.907, 34.0676],
    //   zoom: 4,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    //Create a Marker
    const el = document.createElement('div');
    el.className = 'marker';

    //Add Marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    //
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
