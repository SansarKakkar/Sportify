
const request = indexedDB.open("SportifyDB", 2);

request.onupgradeneeded = function (event) {
    const db = event.target.result;

    // Preserve the existing users store
    if (!db.objectStoreNames.contains("users")) {
        const userStore = db.createObjectStore("users", {
            keyPath: "id",
            autoIncrement: true
        });

        userStore.createIndex("emailId", "emailId", {
            unique: true
        });
    }

    // Create the games store
    if (!db.objectStoreNames.contains("games")) {
        const gameStore = db.createObjectStore("games", {
            keyPath: "id",
            autoIncrement: true
        });

        gameStore.createIndex("sport", "sport", {
            unique: false
        });

        gameStore.createIndex("date", "date", {
            unique: false
        });

        gameStore.createIndex("location", "location", {
            unique: false
        });

        gameStore.createIndex("creatorId", "creatorId", {
            unique: false
        });
    }
};

request.onsuccess = function (event) {
    const db = event.target.result;

    console.log("SportifyDB connected successfully!");
    console.log("Available stores:", Array.from(db.objectStoreNames));

    db.onversionchange = function () {
        db.close();
    };
};

request.onerror = function (event) {
    console.error("Database error:", event.target.error);
};