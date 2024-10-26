function OnToggleAutoTime() {
    const checkbox = document.getElementById('AutoTimeCheckBox');
    const editbox = document.getElementById('DateTimeBox');
    if (checkbox.checked) {
        editbox.setAttribute('readonly', true);
    } else {
        editbox.removeAttribute('readonly');
    }
}

window.onload = function() {
    const StorageKey = 'MarsTracker.Options';
    var Options;

    function ParseDate(s) {
        return new Date((s || '').replace(' ', 'T'));
    }

    function IsValidNumber(s) {
        return typeof s === 'string' && /^[\-\+]?\d+(\.\d*)?$/.test(s);
    }

    function IsValidDate(s) {
        const d = ParseDate(s);
        return Number.isFinite(d.getTime());
    }

    function LoadOptions() {
        let options;
        try {
            options = JSON.parse(window.localStorage.getItem(StorageKey));
        } catch (e) {
        }

        if (!options) options = {};
        if (!IsValidNumber(options.latitude))  options.latitude  = '30';
        if (!IsValidNumber(options.longitude)) options.longitude = '-90';
        if (!IsValidNumber(options.elevation)) options.elevation = '0';
        if (typeof options.automatic !== 'boolean') options.automatic = true;
        if (!IsValidDate(options.date)) options.date = FormatDate(new Date());
        return options;
    }

    function SaveOptions() {
        try {
            window.localStorage.setItem(StorageKey, JSON.stringify(Options));
        } catch (e) {
        }
    }

    function Init() {
        let options = LoadOptions();
        document.getElementById('EditLatitude').value  = options.latitude;
        document.getElementById('EditLongitude').value = options.longitude;
        document.getElementById('EditElevation').value = options.elevation;
        document.getElementById('DateTimeBox').value = options.date;
        let checkbox = document.getElementById('AutoTimeCheckBox');
        checkbox.checked = options.automatic;
        OnToggleAutoTime();
        return options;
    }

    function Pad(s, w) {
        s = s.toFixed(0);
        while (s.length < w) {
            s = '0' + s;
        }
        return s;
    }

    function FormatDate(date) {
        var year = Pad(date.getFullYear(), 4);
        var month = Pad(1 + date.getMonth(), 2);
        var day = Pad(date.getDate(), 2);
        var hour = Pad(date.getHours(), 2);
        var minute = Pad(date.getMinutes(), 2);
        var second = Pad(date.getSeconds(), 2);
        return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    }

    function FormatCoord(x) {
        return x.toFixed(2);
    }

    function getDirection(azimuth) {
        const directions = ['North', 'Northeast', 'East', 'Southeast', 'South', 'Southwest', 'West', 'Northwest'];
        const index = Math.round(azimuth / 45) % 8;
        return directions[index];
    }

    function getAltitudeDescription(altitude) {
        if (altitude < 0) return "below the horizon (not visible)";
        if (altitude < 15) return "very low on the horizon";
        if (altitude < 45) return "low in the sky";
        if (altitude < 75) return "high in the sky";
        return "nearly overhead";
    }

    function UpdateScreen() {
        const autotime = document.getElementById('AutoTimeCheckBox').checked;
        const timebox = document.getElementById('DateTimeBox');
        let text_latitude = document.getElementById('EditLatitude').value;
        let text_longitude = document.getElementById('EditLongitude').value;
        let text_elevation = document.getElementById('EditElevation').value;
        let date;

        if (autotime) {
            date = new Date();
            timebox.value = FormatDate(date);
        } else {
            date = ParseDate(timebox.value);
        }

        if (!IsValidDate(timebox.value) || !IsValidNumber(text_latitude) || !IsValidNumber(text_longitude) || !IsValidNumber(text_elevation)) {
            document.querySelector('.position-panel').style.opacity = '0.5';
            document.querySelector('.viewing-tip').style.display = 'none';
        } else {
            document.querySelector('.position-panel').style.opacity = '1';
            document.querySelector('.viewing-tip').style.display = 'block';

            let latitude = parseFloat(text_latitude);
            let longitude = parseFloat(text_longitude);
            let elevation = parseFloat(text_elevation);
            
            if (latitude !== Options.latitude || longitude !== Options.longitude || elevation !== Options.elevation || Options.automatic !== autotime) {
                Options = {
                    latitude: text_latitude,
                    longitude: text_longitude,
                    elevation: text_elevation,
                    automatic: autotime,
                    date: timebox.value
                };
                SaveOptions();
            }
            
            let observer = new Astronomy.Observer(latitude, longitude, elevation);
            let equ_2000 = Astronomy.Equator('Mars', date, observer, false, true);
            let equ_ofdate = Astronomy.Equator('Mars', date, observer, true, true);
            let hor = Astronomy.Horizon(date, observer, equ_ofdate.ra, equ_ofdate.dec, 'normal');
            
            document.getElementById('Mars_ra').innerText = FormatCoord(equ_2000.ra);
            document.getElementById('Mars_dec').innerText = FormatCoord(equ_2000.dec);
            document.getElementById('Mars_az').innerText = FormatCoord(hor.azimuth);
            document.getElementById('Mars_alt').innerText = FormatCoord(hor.altitude);

            // Update viewing directions
            document.getElementById('direction').innerText = getDirection(hor.azimuth);
            document.getElementById('altitude').innerText = getAltitudeDescription(hor.altitude);
        }

        setTimeout(UpdateScreen, 1000);
    }

    Options = Init();
    UpdateScreen();
}