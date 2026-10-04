
const getVenueId = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
};

const venueID = getVenueId();
let selectedVenue = null;

const openRequest = indexedDB.open("SportifyDB", 3);

openRequest.onsuccess = () => {
    const db = openRequest.result;
    const transaction = db.transaction("venues", "readonly");
    const store = transaction.objectStore("venues");
    const request = store.get(Number(venueID));

    request.onsuccess = () => {
        const venue = request.result;
        selectedVenue = venue;

        document.getElementById("venueName").textContent = venue.venueName;
        document.getElementById("venueLocation").textContent = venue.address;
        document.getElementById("venueSport").textContent = venue.sport;
        document.getElementById("venueDescription").textContent =venue.description || "";
        document.getElementById("venueCourts").textContent = venue.courts;
        document.getElementById("venueOpening").textContent = venue.openingTime;
        document.getElementById("venueClosing").textContent = venue.closingTime;
        document.getElementById("venuePrice").textContent =Number(venue.price).toFixed(2);
        document.getElementById("venueImage").src =URL.createObjectURL(venue.photos[0]);
        updatePriceSummary();
    };

    request.onerror = () => {
        console.error("Could not retrieve venue:", request.error);
    };

    transaction.oncomplete = () => {
        db.close();
    };
};

openRequest.onerror = () => {
    console.error("Could not open SportifyDB:", openRequest.error);
};

const playerLimits = {
    pickleball: 4,
    cricket: 12,
    football: 12,
    badminton: 4,
    tennis: 4,
    basketball: 12,
    volleyball: 12
};


const updatePriceSummary = () => {
    if (!selectedVenue) {
        return;
    }

    const playerCount = Number(document.getElementById("playerCount").value);

    const totalPrice = Number(selectedVenue.price);
    const pricePerPlayer =playerCount > 0 ? totalPrice / playerCount : 0;

    document.getElementById("sessionPrice").textContent =`₹${totalPrice.toFixed(2)}`;

    document.getElementById("summaryPlayers").textContent =playerCount || 0;

    document.getElementById("pricePerPlayer").textContent =`₹${pricePerPlayer.toFixed(2)}`;
};

document.getElementById("playerCount").addEventListener(
    "input",
    updatePriceSummary
);


const createGame = (event) => {
    event.preventDefault();

    const date = document.getElementById("bookingDate").value;
    const maxPlayers = Number(
        document.getElementById("playerCount").value
    );
    const creatorId = Number(localStorage.getItem("currentUserId"));

    if (!creatorId) {
        alert("Please login first.");
        window.location.href = "../login.html";
        return;
    }

    if (!date) {
        alert("Please select a date.");
        return;
    }

    const today = new Date();
    const localToday =
        today.getFullYear() + "-" +
        String(today.getMonth() + 1).padStart(2, "0") + "-" +
        String(today.getDate()).padStart(2, "0");

    if (date < localToday) {
        alert("Please select today or a future date.");
        return;
    }

    const sport = selectedVenue.sport.toLowerCase();
    const limit = playerLimits[sport] || 12;

    if (
        !Number.isInteger(maxPlayers) ||
        maxPlayers < 1 ||
        maxPlayers > limit
    ) {
        alert(`Enter a number of players between 1 and ${limit}.`);
        return;
    }

    const totalPrice = Number(selectedVenue.price);
    const pricePerPlayer = totalPrice / maxPlayers;

    const game = {
        venueId: Number(venueID),
        venueName: selectedVenue.venueName,
        location: selectedVenue.city || selectedVenue.address,
        sport: selectedVenue.sport,
        date: date,
        creatorId: creatorId,
        maxPlayers: maxPlayers,
        players: [creatorId],
        price: totalPrice,
        pricePerPlayer: Number(pricePerPlayer.toFixed(2)),
        status: "open",
        createdAt: new Date().toISOString()
    };

    const dbRequest = indexedDB.open("SportifyDB", 3);

    dbRequest.onsuccess = () => {
        const db = dbRequest.result;
        const transaction = db.transaction("games", "readwrite");
        const store = transaction.objectStore("games");

        store.add(game);

        transaction.oncomplete = () => {
            db.close();

            alert(
                "Game created successfully!\n\n" +
                `Players: ${maxPlayers}\n` +
                `Total venue price: ₹${totalPrice.toFixed(2)}\n` +
                `Price per player: ₹${pricePerPlayer.toFixed(2)}`
            );

            window.location.href = "./games.html";
        };

        transaction.onerror = () => {
            console.error("Could not save game:", transaction.error);
            db.close();
            alert("Could not create the game.");
        };
    };

    dbRequest.onerror = () => {
        console.error("Could not open SportifyDB:", dbRequest.error);
        alert("Could not open the database.");
    };
};

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("bookingForm").addEventListener(
        "submit",
        createGame
    );
});