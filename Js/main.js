document.addEventListener('DOMContentLoaded', () => {

    const passwordInput = document.getElementById('password');
    const passwordConfirm = document.getElementById('conf_passw');
    const passwordError = document.getElementById('password_error');

    const toggleButton = document.getElementById('toggle_password');
    const strengthMessage = document.getElementById('password_strength_msg');
    const submitButton = document.getElementById('submit_button');


    function samePasses() {
        const mainP = passwordInput.value;
        const dummy = passwordConfirm.value;
        if (mainP !== dummy) {
            passwordError.style.display = 'block';
        } else {
            passwordError.style.display = 'none';
        }
    }

    if (passwordInput) passwordInput.addEventListener('input', samePasses);
    if (passwordConfirm) passwordConfirm.addEventListener('input', samePasses);

    //button showoff
    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                if (passwordConfirm) passwordConfirm.type = 'text';
                toggleButton.textContent = 'Hide Passwords';

            } else {
                passwordInput.type = 'password';
                if (passwordConfirm) passwordConfirm.type = 'password';
                toggleButton.textContent = 'Show Passwords';
            }
        });
    }

    function checkPasswordStrength() {
        const password = passwordInput.value;
        let isWeak = false;
        let message = "";
        let color = "";

        if (password.length === 0) {
            if (strengthMessage) strengthMessage.style.display = 'none';
            if (submitButton) submitButton.disabled = false;
            return;
        }

        //weak pass
        const badwords_ar = ["band", "music", "mpanta", "mousiki"];
        const lowerCasePassword = password.toLowerCase();

        for (const word of badwords_ar) {
            if (lowerCasePassword.includes(word)) {
                isWeak = true;
                message = 'Weak: dont use "band", "music", "mpanta", "mousiki"';
                break;
            }
        }

        if (!isWeak) {
            let numberCount = 0;
            for (const char of password) {
                if (char >= '0' && char <= '9') {
                    numberCount++;
                }
            }

            const numberPercent = (numberCount / password.length) * 100;
            if (numberPercent >= 40) {
                isWeak = true;
                message = 'Weak: to many serial numbers';
            }
        }

        if (!isWeak) {
            const charCounts = {};
            for (let i = 0; i < password.length; i++) { //given apo ekfonisi
                const char = password.charAt(i);
                charCounts[char] = (charCounts[char] || 0) + 1;
            }

            let maxCount = 0;
            for (const char in charCounts) {
                maxCount = Math.max(maxCount, charCounts[char]);
            }

            const repeatPercent = (maxCount / password.length) * 100;
            if (repeatPercent >= 50) {
                isWeak = true;
                message = 'Weak: to many same words';
            }
        }


        if (!isWeak) {
            const hasLower = /[a-z]/.test(password);
            const hasUpper = /[A-Z]/.test(password);
            const hasNumber = /[0-9]/.test(password);
            const hasSymbol = /[^a-zA-Z0-9]/.test(password);

            if (hasLower && hasUpper && hasNumber && hasSymbol) {
                message = 'Strong Password';
                color = 'green';
            } else { // || 
                message = 'Medium Password';
                color = 'orange';
            }
        } else {
            color = 'red'; //weak
        }
        //dom update
        if (strengthMessage) {
            strengthMessage.textContent = message;
            strengthMessage.style.color = color;
            strengthMessage.style.display = 'block';
        }
        if (submitButton) submitButton.disabled = isWeak;
    }


    if (passwordInput) {
        passwordInput.addEventListener('input', () => {
            checkPasswordStrength();
            samePasses();
        });
    }

    if (passwordConfirm) {
        passwordConfirm.addEventListener('input', () => {
            samePasses();
        });
    }



    //SECONT PARTTTTT
    const validateBtn = document.getElementById('validate-address-btn');
    const countryInput = document.getElementById('country') || document.getElementById('band_country');
    const cityInput = document.getElementById('city') || document.getElementById('band_city');
    const addressInput = document.getElementById('validate_address') || document.getElementById('band_address');

    const messageSpan = document.getElementById('address-message');
    const latInput = document.getElementById('latitude');
    const lonInput = document.getElementById('longitude');

    if (addressInput) addressInput.addEventListener('input', clearLatLon);
    if (cityInput) cityInput.addEventListener('input', clearLatLon);
    if (countryInput) countryInput.addEventListener('input', clearLatLon);

    if (validateBtn) {
        validateBtn.addEventListener('click', validateAddress);
    }

    function validateAddress() {
        const country = countryInput ? countryInput.value : '';
        const city = cityInput ? cityInput.value : '';
        const address = addressInput ? addressInput.value : '';

        if (!country || !city || !address) {
            showMessage('Enter city/country/address.', 'red');
            return;
        }

        const queryString = `${address}, ${city}, ${country}`;

        clearLatLon();

        const apiKey = "0a44f5767cmsh434e71bcea52503p11a64fjsn3466a029f2fe";
        const url = `https://forward-reverse-geocoding.p.rapidapi.com/v1/search?q=${encodeURIComponent(queryString)}&format=json`;

        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': 'forward-reverse-geocoding.p.rapidapi.com'
            }
        };

        showMessage('Checking...', 'black');
        //-----------given ajax code from class
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) { //given state
                if (xhr.status === 200) { //if ok
                    const data = JSON.parse(xhr.responseText);
                    if (data && data.length > 0) {
                        const firstResult = data[0];

                        const countryCode = firstResult.address ? firstResult.address.country_code : null;

                        if (countryCode && countryCode !== 'gr') {
                            showMessage('Service availble only on Greece', 'red');
                        }
                        else {
                            const lat = firstResult.lat;
                            const lon = firstResult.lon;
                            if (latInput) latInput.value = lat;
                            if (lonInput) lonInput.value = lon;

                            showMessage('Location-Address approved!', 'green');
                            console.log(`Lat: ${lat}, Lon: ${lon}`);
                            showMap(lat, lon);
                        }
                    } else {
                        showMessage('Address not found', 'red');
                    }

                } else {//if we find another responce error such as 400 401.. then false
                    console.error('API Error:', xhr.status, xhr.statusText);
                    showMessage('Connection error, API', 'red');
                }
            }
        };

        xhr.onerror = function () {
            console.error('Network Error');
            showMessage('Check your internet service.', 'red');
        };

        xhr.open('GET', url); //xhm open
        xhr.setRequestHeader('x-rapidapi-key', apiKey);
        xhr.setRequestHeader('x-rapidapi-host', 'forward-reverse-geocoding.p.rapidapi.com');//given

        xhr.send(null); //sending null because we dont want anythng to send
    }

    function showMessage(text, color) {
        if (messageSpan) {
            messageSpan.textContent = text;
            messageSpan.style.color = color;
            messageSpan.style.display = 'inline';
        }
    }

    function clearLatLon() {
        if (latInput) latInput.value = '';
        if (lonInput) lonInput.value = '';
        const mapContainer = document.getElementById('Map');//hiding/destroying the map
        if (mapContainer) mapContainer.style.display = 'none';
        if (map) {
            map.destroy();
            map = null;
        }
    }



    //-------------SECONT PART B-----------------------
    let map = null;
    let markersLayer = null;

    function showMap(lat, lon) {
        const mapContainer = document.getElementById('Map');
        if (!mapContainer) return;

        mapContainer.style.display = 'block';
        if (!map) {
            map = new OpenLayers.Map("Map");
            var mapnik = new OpenLayers.Layer.OSM();
            map.addLayer(mapnik);

            markersLayer = new OpenLayers.Layer.Markers("Markers");
            map.addLayer(markersLayer);
        }

        markersLayer.clearMarkers();

        var position = setPosition(lat, lon);
        const zoom = 14;
        map.setCenter(position, zoom);
        //MARKER
        var markers = markersLayer;
        var mar = new OpenLayers.Marker(position);
        markers.addMarker(mar);
        mar.events.register('mousedown', mar, function (evt) {
            handler(position, 'Your Location');
        })
    }

    function setPosition(lat, lon) {
        var fromProjection = new OpenLayers.Projection("EPSG:4326"); //from wgs 1984 to spherical
        var toProjection = new OpenLayers.Projection("EPSG:900913");
        var position = new OpenLayers.LonLat(parseFloat(lon), parseFloat(lat)).transform(fromProjection, toProjection);
        return position;
    }

    function handler(position, message) {
        if (map && map.popups.length > 0) {
            map.removePopup(map.popups[0]);
        }
        var popup = new OpenLayers.Popup.FramedCloud("Popup", position, null, message, null, true);
        map.addPopup(popup);
    }
    // form submission handling, ta error codes einai sto app.js
    const form = document.getElementById('signupForm');

    // ajax diplotipa check gia username, email, telephone
    function createOrGetMsgSpan(input) {
        let s = input.parentNode.querySelector('.dup-msg');
        if (!s) {
            s = document.createElement('span');
            s.className = 'dup-msg';
            s.style.marginLeft = '8px';
            s.style.fontSize = '0.9em';
            input.parentNode.appendChild(s);
        }
        return s;
    }
    // prosarmogi attachDupCheck gia na douleuei me to form signup 
    function attachDupCheck(inputId, endpoint, paramName) {
        const input = document.getElementById(inputId);
        if (!input) return;
        const msg = createOrGetMsgSpan(input);
        let timer = null;
        input.addEventListener('input', () => {
            clearTimeout(timer);
            timer = setTimeout(async () => {
                const val = input.value.trim();
                // Check if submitButton exists before trying to disable it
                if (!val) { msg.textContent = ''; if (submitButton) submitButton.disabled = false; return; }
                try {
                    const url = `${endpoint}?${encodeURIComponent(paramName)}=${encodeURIComponent(val)}`;
                    const res = await fetch(url);
                    if (!res.ok) {
                        msg.textContent = 'Check error';
                        msg.style.color = 'orange';
                        return;
                    }
                    const data = await res.json();
                    if (data.exists) {
                        msg.textContent = 'Already in use';
                        msg.style.color = 'red';
                        if (submitButton) submitButton.disabled = true;
                    } else {
                        msg.textContent = 'Available';
                        msg.style.color = 'green';
                        if (submitButton) submitButton.disabled = false;
                    }
                } catch (err) {
                    msg.textContent = 'Network error';
                    msg.style.color = 'orange';
                }
            }, 450);
        });
    }

    const API_BASE = 'http://localhost:3000';

    //Detect page type so we call the correct server check logic
    const isBandPage = !!document.querySelector('.section_1_band');
    const entityType = isBandPage ? 'band' : 'user';

    attachDupCheck('username', `${API_BASE}/check/${entityType}/username`, 'username');
    attachDupCheck('email', `${API_BASE}/check/${entityType}/email`, 'email');
    attachDupCheck('telephone', `${API_BASE}/check/${entityType}/telephone`, 'telephone');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const isBand = !!document.querySelector('.section_1_band');

            if (isBand) {
                const band = {
                    username: document.getElementById('username')?.value || '',
                    email: document.getElementById('email')?.value || '',
                    password: document.getElementById('password')?.value || '',
                    band_name: document.getElementById('band_name')?.value || '',
                    music_genres: document.getElementById('music_genres')?.value || '',
                    band_description: document.getElementById('band_description')?.value || '',
                    members_number: parseInt(document.getElementById('members_number')?.value || '0'),
                    foundedYear: document.getElementById('foundedYear')?.value || '',
                    band_city: document.getElementById('band_city')?.value || document.getElementById('city')?.value || '',
                    telephone: document.getElementById('telephone')?.value || '',
                    lat: document.getElementById('latitude')?.value || '',
                    lon: document.getElementById('longitude')?.value || '',
                    webpage: null,
                    photo: null
                };

                try {
                    const res = await fetch(`${API_BASE}/signup/band`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(band)
                    });

                    if (res.ok) {
                        alert('Band signup successful');
                        form.reset();
                        // Clear map and errors after successful submit
                        if (typeof clearLatLon === 'function') clearLatLon();
                        document.querySelectorAll('.dup-msg').forEach(el => el.textContent = '');
                    } else {
                        const text = await res.json(); // Usually json response
                        alert('Band signup failed: ' + (text.error || 'Unknown error'));
                    }
                } catch (err) {
                    alert('Network/server error: ' + err.message);
                }

            } else {
                const user = {
                    username: document.getElementById('username')?.value || '',
                    email: document.getElementById('email')?.value || '',
                    password: document.getElementById('password')?.value || '',
                    firstname: document.getElementById('firstname')?.value || '',
                    lastname: document.getElementById('lastname')?.value || '',
                    birthdate: document.getElementById('birthdate')?.value || '',
                    gender: (document.querySelector('input[name="gender"]:checked')?.value) || '',
                    country: document.getElementById('country')?.value || '',
                    city: document.getElementById('city')?.value || '',
                    address: document.getElementById('validate_address')?.value || '',
                    telephone: document.getElementById('telephone')?.value || '',
                    lat: document.getElementById('latitude')?.value || '',
                    lon: document.getElementById('longitude')?.value || ''
                };

                try {
                    const res = await fetch(`${API_BASE}/signup/user`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(user)
                    });

                    if (res.ok) {
                        alert('User signup successful');
                        form.reset();
                        if (typeof clearLatLon === 'function') clearLatLon();
                        document.querySelectorAll('.dup-msg').forEach(el => el.textContent = '');
                    } else {
                        const text = await res.json();
                        alert('User signup failed: ' + (text.error || 'Unknown error'));
                    }
                } catch (err) {
                    alert('Network/server error: ' + err.message);
                }
            }
        });
    }
    // --- ASKISIS2
    const wantsProfileView = window.location.hash === '#profile';

    const loginSection = document.getElementById('login_section');
    const profileSection = document.getElementById('profile_section');
    const loginForm = document.getElementById('loginForm');
    const updateForm = document.getElementById('updateForm');
    const logoutBtn = document.getElementById('logoutBtn');

    //Check if user is ALREADY logged in on page load
    if (loginSection) {
        checkAuthStatus();
    }

    async function checkAuthStatus() {
        try {
            const res = await fetch('http://localhost:3000/check-auth', {
                credentials: 'include'
            });
            const data = await res.json();

            if (data.loggedIn) {
                if (wantsProfileView) {
                    // ΜΗΝ κάνεις redirect — δείξε το 2ο μέρος (profile)
                    showProfile(data.userData);
                } else {
                    // κράτα το παλιό behaviour
                    window.location.href = "http://localhost:3000/html/users/index_user.html";
                }
            } else {
                loginSection.style.display = 'block';
                profileSection.style.display = 'none';
            }
        } catch (err) {
            console.error(err);
        }
    }


    //Login Submit, alagi login form logo admin -> prosthiki xeroristo login
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('login_username').value;
            const password = document.getElementById('login_password').value;
            const messageP = document.getElementById('login_message');

            //vlepoume arxika gia admin, elenxoume ton kodiko meta sto app.js
            if (username === 'admin') {
                try {
                    const res = await fetch('http://localhost:3000/admin/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, password })
                    });

                    if (res.ok) {
                        window.location.href = "../../admin_dashboard.html";
                    } else {
                        messageP.textContent = "Invalid Admin Credentials";
                    }
                } catch (err) {
                    console.error(err);
                    messageP.textContent = "Server Error";
                }
                return;
            }

            //gia normal users
            try {
                const res = await fetch('http://localhost:3000/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const data = await res.json();

                if (res.ok) {
                    // console.log(data.message);
                    // alert(data.message);
                    checkAuthStatus();
                    //vlepoume kai to profile
                    if (window.location.hash === '#profile') {
                        // blepoume  profile
                        checkAuthStatus();
                    } else {
                        // allios login kai redirect
                        window.location.href = "http://localhost:3000/html/users/index_user.html";
                    }
                } else {
                    messageP.textContent = data.error;
                }
            } catch (err) {
                console.error(err);
                messageP.textContent = "Server Connection Error";
            }
        });
    }
    //login form for band users
    const bandLoginForm = document.getElementById('bandLoginForm'); //id apo band_login.html

    if (bandLoginForm) {
        bandLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('band_login_username').value;
            const password = document.getElementById('band_login_password').value;
            const messageP = document.getElementById('band_login_message');

            try {
                const res = await fetch('http://localhost:3000/band/login', {//sindesi route apo app.js
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await res.json();

                if (res.ok) {
                    window.location.href = "../bands/band_dashboard.html";
                } else {
                    messageP.textContent = data.error;
                }
            } catch (err) {
                console.error(err);
                messageP.textContent = "Server Connection Error";
            }
        });
    }

    function showProfile(user) {
        loginSection.style.display = 'none';
        profileSection.style.display = 'block';

        document.getElementById('welcome_user').textContent = user.username;

        document.getElementById('prof_username').value = user.username;
        document.getElementById('prof_email').value = user.email;
        document.getElementById('prof_password').value = user.password;
        document.getElementById('prof_firstname').value = user.firstname;
        document.getElementById('prof_lastname').value = user.lastname;
        if (user.birthdate) document.getElementById('prof_birthdate').value = new Date(user.birthdate).toISOString().split('T')[0];
        document.getElementById('prof_gender').value = user.gender;
        document.getElementById('prof_country').value = user.country;
        document.getElementById('prof_city').value = user.city;
        document.getElementById('prof_address').value = user.address;
        document.getElementById('prof_telephone').value = user.telephone;
        document.getElementById('prof_lat').value = user.lat;
        document.getElementById('prof_lon').value = user.lon;
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await fetch('http://localhost:3000/logout', { method: 'POST' });
            alert("Logged out");
            window.location.reload(); // Reload to show login form again
        });
    }

    if (updateForm) {
        updateForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const newData = {
                password: document.getElementById('prof_password').value,
                firstname: document.getElementById('prof_firstname').value,
                lastname: document.getElementById('prof_lastname').value,
                birthdate: document.getElementById('prof_birthdate').value,
                gender: document.getElementById('prof_gender').value,
                country: document.getElementById('prof_country').value,
                city: document.getElementById('prof_city').value,
                address: document.getElementById('prof_address').value,
                telephone: document.getElementById('prof_telephone').value,
                lat: document.getElementById('prof_lat').value,
                lon: document.getElementById('prof_lon').value
            };

            const res = await fetch('http://localhost:3000/update/user', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newData)
            });

            if (res.ok) {
                alert("Data updated successfully!");
                document.getElementById('update_msg').textContent = "Changes saved!";
                document.getElementById('update_msg').style.color = "green";
            } else {
                alert("Update failed");
            }
        });
    }


    //gia askisi 4 reviews
    const reviewBtn = document.getElementById('submit_review_btn');

    if (reviewBtn) {
        reviewBtn.addEventListener('click', async () => {
            const bandNameInput = document.getElementById('review_band_name');
            const senderInput = document.getElementById('review_sender');
            const ratingInput = document.getElementById('review_rating');
            const textInput = document.getElementById('review_text');
            const resultDiv = document.getElementById('review_result');

            if (!bandNameInput.value || !senderInput.value || !textInput.value) {
                resultDiv.style.color = 'red';
                resultDiv.innerText = "Please fill in all fields.";
                return;
            }

            const ratingVal = parseInt(ratingInput.value);
            if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
                resultDiv.style.color = 'red';
                resultDiv.innerText = "Rating must be a number between 1 and 5.";
                return;
            }

            const reviewData = { //etoimazoume ta data gia sent sto server
                band_name: bandNameInput.value,
                sender: senderInput.value,
                review: textInput.value,
                rating: ratingVal
            };

            try {
                const response = await fetch('http://localhost:3000/review/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(reviewData)
                });

                const data = await response.json();

                if (response.ok) {
                    resultDiv.style.color = 'green';
                    resultDiv.innerText = "Success: " + data.message;

                    bandNameInput.value = ''; //clear inputs
                    senderInput.value = '';
                    textInput.value = '';
                    ratingInput.value = '5';
                } else {
                    resultDiv.style.color = 'red'; //band not found or other error
                    resultDiv.innerText = "Error: " + (data.message || data.error);
                }
            } catch (error) {
                console.error('Fetch error:', error);
                resultDiv.style.color = 'red';
                resultDiv.innerText = "Failed to connect to server.";
            }
        });
    }


});