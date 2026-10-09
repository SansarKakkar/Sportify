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

        let games = getRequest.result.filter((game) =>
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
        }

        venuesRequest.onsuccess = () => {
            const venues = venuesRequest.result;

            function displayGames(gamesToDisplay) {
                gamesGrid.replaceChildren();

                resultsCount.textContent =
                    `${gamesToDisplay.length} ${gamesToDisplay.length === 1 ? "game" : "games"} found`;

                if (gamesToDisplay.length === 0) {
                    gamesGrid.style.display = "none";
                    emptyState.style.display = "block";
                    return;
                }

                gamesGrid.style.display = "grid";
                emptyState.style.display = "none";

                gamesToDisplay.forEach((game) => {
                    const gameCard = document.createElement("article");
                    gameCard.className = "game-card";

                    const imageContainer = document.createElement("div");
                    imageContainer.className = "game-card-image";

                    const venueData = venues.find(
                        (venue) => Number(venue.id) === Number(game.venueId)
                    );

                    if (
                        venueData?.photos?.length > 0 &&
                        venueData.photos[0] instanceof Blob
                    ) {
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

                    joinButton.onclick = () => {
                        const currentUserID = localStorage.getItem("currentUserId");

                        if (!currentUserID) {
                            alert("Please log in");
                            return;
                        }

                        if (
                            game.players.some(
                                player => Number(player) === Number(currentUserID)
                            )
                        ) {
                            alert("You have already booked");
                            return;
                        }

                        if (game.players.length >= game.maxPlayers) {
                            alert("This game is full");
                            return;
                        }

                        showPaymentModal(
                            game,
                            db,
                            currentUserID,
                            () => {
                                players.textContent =
                                    `Players joined: ${game.players.length}/${game.maxPlayers}`;

                                if (game.players.length >= game.maxPlayers) {
                                    status.textContent = "Full";
                                    joinButton.textContent = "Game Full";
                                    joinButton.disabled = true;
                                } else {
                                    joinButton.textContent = "✓ Joined";
                                    joinButton.disabled = true;
                                }
                            }
                        );
                    };

                    if (
                        game.players.some(
                            player =>
                                Number(player) ===
                                Number(localStorage.getItem("currentUserId"))
                        )
                    ) {
                        joinButton.textContent = "✓ Joined";
                        joinButton.disabled = true;
                    }

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
            }

            displayGames(games);

            const params = new URLSearchParams(window.location.search);
            const selectedSport = params.get("sport");
            const searchInput = document.getElementById("gameSearch");

            if (selectedSport) {
                searchInput.value = selectedSport;

                games = games.filter(
                    game =>
                        game.sport.toLowerCase() === selectedSport.toLowerCase()
                );

                displayGames(games);
            }

            searchInput.addEventListener("input", () => {
                const searchValue = searchInput.value.toLowerCase().trim();

                const filteredGames = getRequest.result.filter((game) =>
                    game.date >= todayDate &&
                    game.status !== "closed" &&
                    game.players.length < game.maxPlayers &&
                    (
                        game.venueName.toLowerCase().includes(searchValue) ||
                        game.sport.toLowerCase().includes(searchValue) ||
                        game.location.toLowerCase().includes(searchValue)
                    )
                );

                displayGames(filteredGames);
            });
        };
    };

};

request.onerror = () => {
    console.error("Could not open SportifyDB:", request.error);

    document.getElementById("resultsCount").textContent =
        "Could not load games.";

    document.getElementById("emptyState").style.display = "block";
};

function showPaymentModal(game, db, currentUserID, onSuccess) {
    if (document.getElementById("paymentModal")) {
        return;
    }

    const overlay = document.createElement("div");
    overlay.id = "paymentModal";
    overlay.className = "payment-overlay";

    const modal = document.createElement("div");
    modal.className = "payment-modal";

    const heading = document.createElement("h2");
    heading.textContent = "Choose payment";

    const description = document.createElement("p");
    description.className = "payment-description";
    description.textContent = `${game.sport} at ${game.venueName}`;

    const amount = document.createElement("h3");
    amount.className = "payment-amount";
    amount.textContent =
        `₹${Number(game.pricePerPlayer).toFixed(2)}`;

    const amountLabel = document.createElement("p");
    amountLabel.className = "payment-description";
    amountLabel.textContent = "Your share";

    const options = document.createElement("div");
    options.className = "payment-options";

    const methods = [
        {
            value: "UPI",
            title: "UPI",
            description: "Google Pay, PhonePe, Paytm"
        },
        {
            value: "Card",
            title: "Credit / Debit Card",
            description: "Visa, Mastercard, RuPay"
        },
        {
            value: "Pay at Venue",
            title: "Pay at Venue",
            description: "Pay when you arrive"
        }
    ];

    let selectedMethod = "UPI";

    methods.forEach((method) => {
        const label = document.createElement("label");
        label.className = "payment-option";

        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "paymentMethod";
        radio.value = method.value;
        radio.checked = method.value === selectedMethod;

        radio.addEventListener("change", () => {
            selectedMethod = method.value;
        });

        const textContainer = document.createElement("div");

        const title = document.createElement("strong");
        title.textContent = method.title;

        const details = document.createElement("p");
        details.textContent = method.description;

        textContainer.append(title, details);
        label.append(radio, textContainer);
        options.appendChild(label);
    });

    const error = document.createElement("p");
    error.className = "payment-error";
    error.setAttribute("role", "alert");

    const confirmButton = document.createElement("button");
    confirmButton.className = "payment-confirm-btn";
    confirmButton.textContent =
        `Confirm · ₹${Number(game.pricePerPlayer).toFixed(2)}`;

    const cancelButton = document.createElement("button");
    cancelButton.className = "payment-cancel-btn";
    cancelButton.textContent = "Cancel";

    const closeModal = () => overlay.remove();

    cancelButton.addEventListener("click", closeModal);

    overlay.addEventListener("click", (event) => {
        if (event.target === overlay) {
            closeModal();
        }
    });

    confirmButton.addEventListener("click", () => {
        error.textContent = "";
        confirmButton.disabled = true;
        confirmButton.textContent = "Confirming...";

        const transaction = db.transaction("games", "readwrite");
        const store = transaction.objectStore("games");
        const getRequest = store.get(game.id);

        let bookingSucceeded = false;
        let errorMessage = "";

        getRequest.onsuccess = () => {
            const latestGame = getRequest.result;

            if (!latestGame) {
                errorMessage = "This game no longer exists.";
                transaction.abort();
                return;
            }

            if (!Array.isArray(latestGame.players)) {
                latestGame.players = [];
            }

            const alreadyJoined = latestGame.players.some(
                player => Number(player) === Number(currentUserID)
            );

            if (alreadyJoined) {
                errorMessage = "You have already joined this game.";
                transaction.abort();
                return;
            }

            if (
                latestGame.status === "closed" ||
                latestGame.players.length >= latestGame.maxPlayers
            ) {
                errorMessage = "Sorry, this game is full.";
                transaction.abort();
                return;
            }

            latestGame.players.push(currentUserID);

            if (!latestGame.paymentMethods) {
                latestGame.paymentMethods = {};
            }

            latestGame.paymentMethods[currentUserID] = selectedMethod;

            if (latestGame.players.length >= latestGame.maxPlayers) {
                latestGame.status = "closed";
            }

            const putRequest = store.put(latestGame);

            putRequest.onsuccess = () => {
                bookingSucceeded = true;
                game.players = latestGame.players;
                game.status = latestGame.status;
                game.paymentMethods = latestGame.paymentMethods;
            };
        };

        transaction.oncomplete = () => {
            if (bookingSucceeded) {
                closeModal();

                alert(
                    `Booking successful!\n\n` +
                    `Payment method: ${selectedMethod}\n` +
                    `Amount: ₹${Number(game.pricePerPlayer).toFixed(2)}\n\n` +
                    (
                        selectedMethod === "Pay at Venue"
                            ? "Please pay when you arrive at the venue."
                            : "Demo booking confirmed. No actual payment was processed."
                    )
                );

                onSuccess();
            } else {
                confirmButton.disabled = false;
                confirmButton.textContent =
                    `Confirm · ₹${Number(game.pricePerPlayer).toFixed(2)}`;

                error.textContent =
                    errorMessage || "Could not confirm your booking.";
            }
        };

        transaction.onabort = () => {
            confirmButton.disabled = false;
            confirmButton.textContent =
                `Confirm · ₹${Number(game.pricePerPlayer).toFixed(2)}`;

            error.textContent =
                errorMessage || "Could not confirm your booking.";
        };

        transaction.onerror = () => {
            error.textContent = "A database error occurred.";
        };
    });

    modal.append(
        heading,
        description,
        amount,
        amountLabel,
        options,
        error,
        confirmButton,
        cancelButton
    );

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}