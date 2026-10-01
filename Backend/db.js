
const request = indexedDB.open("SportifyDB", 3);

request.onupgradeneeded = ()=> {
    const db = request.result;

    if (!db.objectStoreNames.contains("users")) {
        const userStore = db.createObjectStore("users", {
            keyPath: "id",
            autoIncrement: true
        });

        userStore.createIndex("emailId", "emailId", {
            unique: true
        });
    }

    if (!db.objectStoreNames.contains("games")) {
        const gameStore = db.createObjectStore("games", {
            keyPath: "id",
            autoIncrement: true
        });

        gameStore.createIndex("sport", "sport", { unique: false });
        gameStore.createIndex("date", "date", { unique: false });
        gameStore.createIndex("location", "location", { unique: false });
        gameStore.createIndex("creatorId", "creatorId", { unique: false });
    }

    if (!db.objectStoreNames.contains("venueOwners")) {
        const ownerStore = db.createObjectStore("venueOwners", {
            keyPath: "id",
            autoIncrement: true
        });

        ownerStore.createIndex("businessEmail", "businessEmail", {
            unique: true
        });
    }

    if (!db.objectStoreNames.contains("venues")) {
        const venueStore = db.createObjectStore("venues", {
            keyPath: "id",
            autoIncrement: true
        });

        venueStore.createIndex("ownerId", "ownerId", { unique: false });
        venueStore.createIndex("sport", "sport", { unique: false });
        venueStore.createIndex("city", "city", { unique: false });
    }
};

request.onsuccess = ()=> {
    const db =request.result;
    console.log("SportifyDB connected. Version:", db.version);

    db.onversionchange = function () {
        db.close();
    };
};

request.onerror = function () {
    console.error("Could not open SportifyDB:", request.error);
};
