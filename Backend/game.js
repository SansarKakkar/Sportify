
const request = indexedDB.open("SportifyDB", 3);

request.onsuccess = () => {
    const db = request.result;
    const transaction = db.transaction(["games", "venues"], "readonly");
    const store = transaction.objectStore("games");
    const venuesStore = transaction.objectStore("venues");
    const getRequest = store.getAll();
    const venuesRequest = venuesStore.getAll();

    getRequest.onsuccess = () => {
        const today = new Date();

        const todayDate =
            `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

        const games = getRequest.result.filter((game) =>
            game.date >= todayDate &&
            game.status !== "closed" &&
            game.players.length < game.maxPlayers
        );

        const gamesGrid = document.getElementById("gamesGrid");
        const emptyState = document.getElementById("emptyState");
        const resultsCount = document.getElementById("resultsCount");

        gamesGrid.replaceChildren();

        if (games.length === 0) {
            gamesGrid.style.display = "none";
            emptyState.style.display = "block";
            resultsCount.textContent = "0 games found";
            return;
        }

        emptyState.style.display = "none";
        gamesGrid.style.display = "grid";
        resultsCount.textContent =
            `${games.length} ${games.length === 1 ? "game" : "games"} found`;

        venuesRequest.onsuccess = () => {
            const venues = venuesRequest.result;

            games.forEach((game) => {
                const gameCard = document.createElement("article");
                gameCard.className = "game-card";

                const imageContainer = document.createElement("div");
                imageContainer.className = "game-card-image";

                const venueData = venues.find(
                    (venue) => Number(venue.id) === Number(game.venueId)
                );

                if (venueData?.photos?.length > 0 &&
                    venueData.photos[0] instanceof Blob) {
                    const image = document.createElement("img");
                    image.src = URL.createObjectURL(venueData.photos[0]);
                    image.alt = game.venueName;
                    imageContainer.appendChild(image);
                } else {
                    imageContainer.textContent = "🏟️";
                }

                const sport = document.createElement("p");
                sport.className = "game-sport";
                sport.textContent = game.sport;

                const venue = document.createElement("h3");
                venue.textContent = game.venueName;

                const location = document.createElement("p");
                location.className = "game-location";
                location.textContent = `📍 ${game.location}`;

                const date = document.createElement("p");
                date.className = "game-date";
                date.textContent = `📅 ${game.date}`;

                const players = document.createElement("p");
                players.className = "game-players";
                players.textContent =
                    `Players joined: ${game.players.length}/${game.maxPlayers}`;

                const totalPrice = document.createElement("p");
                totalPrice.className = "game-total-price";
                totalPrice.textContent =
                    `Total venue price: ₹${Number(game.price).toFixed(2)}`;

                const playerPrice = document.createElement("p");
                playerPrice.className = "game-player-price";
                playerPrice.textContent =
                    `Price per player: ₹${Number(game.pricePerPlayer).toFixed(2)}`;

                const status = document.createElement("span");
                status.className = "game-status";
                status.textContent = "Open";

                const joinButton = document.createElement("button");
                joinButton.className = "join-game-btn";
                joinButton.textContent = "+ Join";
                joinButton.type = "button";

                joinButton.addEventListener("click", () => {
                    const currentPlayers = game.players.length;

                    if (currentPlayers >= game.maxPlayers) {
                        return;
                    }

                    game.players.push(null);

                    players.textContent =
                        `Players joined: ${game.players.length}/${game.maxPlayers}`;

                    if (game.players.length >= game.maxPlayers) {
                        status.textContent = "Full";
                        joinButton.textContent = "Game Full";
                        joinButton.disabled = true;
                    }
                });

                gameCard.append(
                    imageContainer,
                    sport,
                    venue,
                    location,
                    date,
                    players,
                    totalPrice,
                    playerPrice,
                    status,
                    joinButton
                );

                gamesGrid.appendChild(gameCard);
            });
        };
    };

    transaction.oncomplete = () => db.close();
};

request.onerror = () => {
    console.error("Could not open SportifyDB:", request.error);

    document.getElementById("resultsCount").textContent =
        "Could not load games.";

    document.getElementById("emptyState").style.display = "block";
};