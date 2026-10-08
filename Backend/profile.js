const currentUserId = localStorage.getItem("currentUserId");
console.log("Current user ID:", currentUserId);
if (currentUserId) {
    const dbRequest = indexedDB.open("SportifyDB", 3);
    dbRequest.onsuccess = () => {
        const db = dbRequest.result;

        const transaction = db.transaction("users", "readonly");
        const userStore = transaction.objectStore("users");

        const request = userStore.get(Number(currentUserId));

        request.onsuccess = () => {
            const user = request.result;
            if (!user) return;
            const firstLetter = user.fullName.charAt(0);
            console.log(firstLetter);
            document.getElementById("username").textContent = user.fullName;
            document.getElementById("email").textContent = user.email;
            document.getElementById("username2").textContent = user.fullName;
            document.getElementById("email2").textContent = user.email;
            document.getElementById("city").textContent = user.city;
            document.getElementById("avatar").textContent = firstLetter;
            console.log(user);
        };
    }
};
function logout() {
    localStorage.removeItem("currentUserId");
    window.location.href = "../index.html";
}