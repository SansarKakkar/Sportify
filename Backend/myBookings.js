const request = indexedDB.open("SportifyDB", 3);

request.onsuccess = () => {

    const db = request.result;

    const currentUserID = localStorage.getItem("currentUserId");

    const bookingsGrid = document.getElementById("bookingsGrid");
    const emptyState = document.getElementById("emptyState");
    const resultsCount = document.getElementById("resultsCount");


    if (!currentUserID) {

        bookingsGrid.style.display = "none";
        emptyState.style.display = "block";

        emptyState.querySelector("h3").textContent =
            "Please log in";

        emptyState.querySelector("p").textContent =
            "You need to log in to view your bookings.";

        return;
    }


    const transaction = db.transaction(
        ["games", "venues"],
        "readonly"
    );

    const gamesStore = transaction.objectStore("games");
    const venuesStore = transaction.objectStore("venues");

    const getRequest = gamesStore.getAll();
    const venuesRequest = venuesStore.getAll();


    getRequest.onsuccess = () => {

        const games = getRequest.result.filter((game) => {

            return game.players.some(
                player => Number(player) === Number(currentUserID)
            );

        });


        venuesRequest.onsuccess = () => {

            const venues = venuesRequest.result;

            bookingsGrid.replaceChildren();


            if (games.length === 0) {

                bookingsGrid.style.display = "none";
                emptyState.style.display = "block";

                resultsCount.textContent = "0 bookings";

                return;
            }


            emptyState.style.display = "none";
            bookingsGrid.style.display = "grid";

            resultsCount.textContent =
                `${games.length} ${games.length === 1 ? "booking" : "bookings"}`;


            games.forEach((game) => {

                const gameCard =
                    document.createElement("article");

                gameCard.className = "game-card";


                /* ================= IMAGE ================= */

                const imageContainer =
                    document.createElement("div");

                imageContainer.className =
                    "game-card-image";


                const venueData = venues.find(
                    venue =>
                        Number(venue.id) ===
                        Number(game.venueId)
                );


                if (
                    venueData?.photos?.length > 0 &&
                    venueData.photos[0] instanceof Blob
                ) {

                    const image =
                        document.createElement("img");

                    image.src =
                        URL.createObjectURL(
                            venueData.photos[0]
                        );

                    image.alt =
                        game.venueName;

                    imageContainer.appendChild(image);

                } else {

                    imageContainer.textContent =
                        "🏟️";
                }


                /* ================= SPORT ================= */

                const sport =
                    document.createElement("p");

                sport.className =
                    "game-sport";

                sport.textContent =
                    game.sport;


                /* ================= VENUE ================= */

                const venue =
                    document.createElement("h3");

                venue.textContent =
                    game.venueName;


                /* ================= LOCATION ================= */

                const location =
                    document.createElement("p");

                location.className =
                    "game-location";

                location.textContent =
                    `📍 ${game.location}`;


                /* ================= DATE ================= */

                const date =
                    document.createElement("p");

                date.className =
                    "game-date";

                date.textContent =
                    `📅 ${game.date}`;


                /* ================= PLAYERS ================= */

                const players =
                    document.createElement("p");

                players.className =
                    "game-players";

                players.textContent =
                    `Players joined: ${game.players.length}/${game.maxPlayers}`;


                /* ================= TOTAL PRICE ================= */

                const totalPrice =
                    document.createElement("p");

                totalPrice.className =
                    "game-total-price";

                totalPrice.textContent =
                    `Total venue price: ₹${Number(game.price).toFixed(2)}`;


                /* ================= PLAYER PRICE ================= */

                const playerPrice =
                    document.createElement("p");

                playerPrice.className =
                    "game-player-price";

                playerPrice.textContent =
                    `Your share: ₹${Number(game.pricePerPlayer).toFixed(2)}`;


                /* ================= STATUS ================= */

                const status =
                    document.createElement("span");

                status.className =
                    "game-status";

                status.textContent =
                    game.players.length >= game.maxPlayers
                        ? "Full"
                        : "Joined";


                /* ================= CARD ================= */

                gameCard.append(
                    imageContainer,
                    sport,
                    venue,
                    location,
                    date,
                    players,
                    totalPrice,
                    playerPrice,
                    status
                );


                bookingsGrid.appendChild(gameCard);

            });

        };

    };


    transaction.oncomplete = () => {

        db.close();

    };

};


request.onerror = () => {

    console.error(
        "Could not open SportifyDB:",
        request.error
    );

};