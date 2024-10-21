window.onload = function() {
    fetch('https://ipapi.co/json/')
        .then(response => response.json())
        .then(data => {
            const location = `${data.city}, ${data.region}, ${data.country}`;
            document.getElementById('location').innerHTML = `Your location: ${location}`;

            const latitude = data.latitude;
            const longitude = data.longitude;
            const appId = 'af0637f3-ec55-4460-bf3d-5b6e869f5396';
            const appSecret = 'f58acdd049c575d670a0c1d06d2f14c0e03ac7407f815acbe482bf311c2b622dea92e9e0959d7307a19a39a56aff782e1c2f62c6b4ff4401e1718b1fddd42eba72db0e63bdf9f6ef4b9a63345a8b8c43fd5e6560887b6dd788e580432dc5b453e56f4224b6d194f560f2c43589191d8b';
            const authString = btoa(`${appId}:${appSecret}`);

            const today = new Date().toISOString().split('T')[0];  // Get today's date in YYYY-MM-DD format
            const time = new Date().toISOString().split('T')[1].split('.')[0];  // Get current time in HH:MM:SS format

            const url = `https://api.astronomyapi.com/api/v2/bodies/positions?longitude=${longitude}&latitude=${latitude}&elevation=1&from_date=${today}&to_date=${today}&time=${time}`;

            fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Basic ${authString}`
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(marsData => {
                    console.log('Mars Data:', marsData);
                    const marsPosition = marsData.data.table.rows[0].cells;
                    document.getElementById('mars-info').innerHTML = `Mars is currently at Right Ascension: ${marsPosition[0].value}, Declination: ${marsPosition[1].value}.`;
                })
                .catch(error => console.error('Error fetching Mars data:', error));
        })
        .catch(error => console.error('Error fetching location:', error));
};
