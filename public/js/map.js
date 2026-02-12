console.log("Map script starting...");

mapboxgl.accessToken = mapToken;

// Set default coordinates if listing geometry is missing or invalid
const defaultCoords = [77.209, 28.613]; // Delhi
const coords = (listing.geometry && listing.geometry.coordinates && listing.geometry.coordinates.length === 2) 
    ? listing.geometry.coordinates 
    : defaultCoords;

console.log("Using coordinates for map center:", coords);

const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v12', // style URL
    center: coords, // starting position [lng, lat]
    zoom: 12 // starting zoom
});

// Add navigation control (the +/- zoom buttons and compass)
map.addControl(new mapboxgl.NavigationControl());

// Only add marker if coordinates are valid
if (listing.geometry && listing.geometry.coordinates && listing.geometry.coordinates.length === 2) {
    // Create custom popup
    const popup = new mapboxgl.Popup({ 
        offset: 25,
        closeButton: true,
        closeOnClick: false
    }).setHTML(
        `<div style="padding: 10px; font-family: Arial, sans-serif;">
            <h5 style="margin: 0 0 8px 0; color: #fe424d;">${listing.title}</h5>
            <p style="margin: 0 0 5px 0; font-size: 13px;">📍 ${listing.location || 'Location'}</p>
            <p style="margin: 0; font-size: 12px; color: #666;">💰 ₹${listing.price.toLocaleString("en-IN")}</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #999;">Exact location will be provided after booking</p>
        </div>`
    );

    // Create marker with custom styling
    const marker = new mapboxgl.Marker({ 
        color: '#fe424d',
        scale: 1.2
    })
        .setLngLat(listing.geometry.coordinates)
        .setPopup(popup)
        .addTo(map);

    // Open popup by default
    marker.togglePopup();

    console.log("Marker successfully added at:", listing.geometry.coordinates);
    console.log("Listing details:", {
        title: listing.title,
        location: listing.location,
        price: listing.price
    });
} else {
    console.warn("Marker not added: No valid coordinates found for this listing.");
}

map.on('error', (e) => {
    console.error("Mapbox error:", e);
});
