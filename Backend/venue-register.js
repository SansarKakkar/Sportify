const register=(event)=>{
        event.preventDefault();

        const venueName = document.getElementById("venueName").value.trim();
        const ownerName = document.getElementById("ownerName").value.trim();
        const businessEmail = document.getElementById("businessEmail").value.trim().toLowerCase();
        const phone = document.getElementById("phone").value.trim();
        const city = document.getElementById("city").value.trim();
        const address = document.getElementById("address").value.trim();

        const sportInput = document.querySelector('input[name="sports"]:checked');
        console.log(sportInput);
        const courts = Number(document.getElementById("courts").value);
        const openingTime = document.getElementById("openingTime").value;
        const closingTime = document.getElementById("closingTime").value;
        const price = Number(document.getElementById("price").value);

        const description = document.getElementById("description").value.trim();

        const password = document.getElementById("accountPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        const termsAccepted = document.getElementById("terms").checked;

        const photoInput = document.getElementById("venuePhotos");
        const files = Array.from(photoInput.files);

        const amenities = Array.from(
            document.querySelectorAll('input[name="amenities"]:checked')
        ).map(input => input.value);

        if (
            !venueName || !ownerName || !businessEmail ||
            !phone || !city || !address
        ) {
            alert("Please complete all venue and owner details.");
            return;
        }

        if (!sportInput) {
            alert("Please select one sport for your venue.");
            return;
        }

        if (
            !Number.isInteger(courts) || courts < 1 ||
            !openingTime || !closingTime ||
            openingTime >= closingTime ||
            !Number.isFinite(price) || price <= 0
        ) {
            alert("Please enter valid courts, opening hours, and hourly price.");
            return;
        }

        if (password.length < 8) {
            alert("Password must contain at least 8 characters.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        if (!termsAccepted) {
            alert("Please accept the partner terms to continue.");
            return;
        }

        if (files.length > 5) {
            alert("You can upload a maximum of 5 photos.");
            return;
        }

        const validTypes = ["image/jpeg", "image/png", "image/webp"];

        for (const file of files) {
            if (!validTypes.includes(file.type)) {
                alert("Please upload only PNG, JPG, or WEBP images.");
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                alert("Each photo must be smaller than 5 MB.");
                return;
            }
        }

        const photos = files.map(file =>
            file.slice(0, file.size, file.type)
        );

        const owner = {
            ownerName,
            businessEmail,
            phone,
            password
        };

        const venue = {
            venueName,
            city,
            address,
            courts,
            sport: sportInput.value,
            openingTime,
            closingTime,
            price,
            amenities,
            description,
            photos,
            createdAt: new Date().toISOString()
        };


        const openRequest = indexedDB.open("SportifyDB", 3);

        openRequest.onsuccess = function () {
            const db = openRequest.result;

            const transaction = db.transaction(
                ["venueOwners", "venues"],
                "readwrite"
            );

            const ownerStore = transaction.objectStore("venueOwners");
            const venueStore = transaction.objectStore("venues");

            let duplicateEmail = false;

            const emailRequest = ownerStore
                .index("businessEmail")
                .get(businessEmail);

            emailRequest.onsuccess = function () {
                if (emailRequest.result) {
                    duplicateEmail = true;
                    transaction.abort();
                    return;
                }

                const ownerRequest = ownerStore.add(owner);

                ownerRequest.onsuccess = function () {
                    venue.ownerId = ownerRequest.result;
                    venueStore.add(venue);
                };
            };

            transaction.oncomplete = function () {
                db.close();

                alert("Venue registered successfully! Please sign in.");

                window.location.href = "./venue-login.html";
            };

            transaction.onabort = function () {
                db.close();

                if (duplicateEmail) {
                    alert("An account with this business email already exists.");
                } else {
                    alert("Registration could not be completed. Please try again.");
                }
            };

            transaction.onerror = function () {
                console.error("Registration transaction failed:", transaction.error);
            };
        };

        openRequest.onerror = function () {
            alert("Could not connect to the database. Please try again.");
        };
    ;
}