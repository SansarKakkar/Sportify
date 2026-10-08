let allVenues = [];

const searchInput = () => {
    const searchValue = document.getElementById("venueSearch").value.toLowerCase().trim();

    const filteredVenues = allVenues.filter((venue) => {
        const searchableText = [venue.venueName, venue.sport, venue.city, venue.address]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        return searchableText.includes(searchValue);
    });

    displayVenue(filteredVenues);
};

const loadvenue = () => {
    const openRequest = indexedDB.open("SportifyDB", 3);
    openRequest.onsuccess = () => {
        const db = openRequest.result;
        const transaction = db.transaction("venues", "readonly");
        const store = transaction.objectStore("venues");
        const getRequest = store.getAll();
        getRequest.onsuccess = () => {
            allVenues = getRequest.result;
            displayVenue(allVenues);
        }
        getRequest.onerror = () => {
            console.error("Could not retrieve venues:", getRequest.error);
        }
    };
    openRequest.onerror = () => {
        console.error("Could not open SportifyDB:", openRequest.error);
    };
}
const displayVenue = (venues) => {
    const venuesGrid = document.getElementById("venuesGrid");
    const resultsCount = document.getElementById("venueResultsCount");
    const emptyState = document.getElementById("venuesEmptyState");
    venuesGrid.replaceChildren();

    if (resultsCount) {
        resultsCount.textContent = `${venues.length} venues found`;
    }

    if (emptyState) {
        emptyState.style.display = venues.length === 0 ? "block" : "none";
    }

    venues.forEach((venue) => {
        const card = document.createElement("article");
        card.className = "venue-card";

        const imageContainer = document.createElement("div");
        imageContainer.className = "venue-card-image";

        if (venue.photos && venue.photos.length > 0) {
            const image = document.createElement("img");

            const imageUrl = URL.createObjectURL(venue.photos[0]);

            image.src = imageUrl;
            image.alt = `${venue.venueName} venue`;
            image.loading = "lazy";

            imageContainer.appendChild(image);

        } else {
            imageContainer.textContent = "🏟️";
        }

        const content = document.createElement("div");
        content.className = "venue-card-content";

        const name = document.createElement("h3");
        name.textContent = venue.venueName;

        const location = document.createElement("p");
        location.className = "venue-location";
        location.textContent = `${venue.city} · ${venue.address}`;

        const sport = document.createElement("p");
        sport.className = "venue-sport";
        sport.textContent = venue.sport
            ? venue.sport.charAt(0).toUpperCase() + venue.sport.slice(1)
            : "Sport not specified";

        const details = document.createElement("p");
        details.className = "venue-details";
        details.textContent =
            `${venue.courts} court(s) · ${venue.openingTime}–${venue.closingTime}`;

        const price = document.createElement("p");
        price.className = "venue-price";
        price.textContent = `₹${venue.price} / hour`;

        card.onclick = () => {
            window.location.href = `../Frontend/booking.html?id=${venue.id}`;
        };

        content.append(
            name,
            location,
            sport,
            details,
            price,
        );

        card.append(imageContainer, content);
        venuesGrid.appendChild(card);
    });
}

loadvenue();

document.getElementById("searchVenuesBtn").addEventListener("click", searchInput);
document.getElementById("venueSearch").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        searchInput();
    }
});
const locationSearchInput = document.getElementById("locationSearch");
if (locationSearchInput) {
    locationSearchInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            searchInput();
        }
    });
}
