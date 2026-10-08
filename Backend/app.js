(function () {
    const activeUserId = localStorage.getItem("currentUserId");
    if (!activeUserId) return;

    const dbRequest = indexedDB.open("SportifyDB", 3);

    dbRequest.onsuccess = () => {
        const db = dbRequest.result;
        if (!db.objectStoreNames.contains("users")) return;

        const transaction = db.transaction("users", "readonly");
        const userStore = transaction.objectStore("users");

        const request = userStore.get(Number(activeUserId));

        request.onsuccess = () => {
            const user = request.result;
            if (user) {
                const loggedOut = document.getElementById("loggedOutActions");
                const loggedIn = document.getElementById("loggedInActions");
                if (loggedOut) loggedOut.style.display = "none";
                if (loggedIn) loggedIn.style.display = "block";

                document.querySelectorAll(".welcome-name").forEach((el) => {
                    el.textContent = user.fullName;
                });
            }
        };
    };
})();
