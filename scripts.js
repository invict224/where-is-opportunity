window.onload = function() {
    fetch('https://ipapi.co/json/')
        .then(response => response.json())
        .then(data => {
            const location = `${data.city}, ${data.region}, ${data.country}`;
            document.getElementById('location').innerHTML = `Your location: ${location}`;

            // Replace this part with actual Mars tracking logic
            document.getElementById('mars-info').innerHTML = `Mars is currently visible from ${location}.`;
        })
        .catch(error => console.error('Error fetching location:', error));
};
