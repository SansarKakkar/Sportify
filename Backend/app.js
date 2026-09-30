const currentUserId = localStorage.getItem("currentUserId");
if(currentUserId){
    const dbRequest = indexedDB.open("SportifyDB", 1);

    dbRequest.onsuccess = () => {
        const db = dbRequest.result;

        const transaction = db.transaction("users", "readonly");
        const userStore = transaction.objectStore("users");

        const request = userStore.get(Number(currentUserId));

        request.onsuccess = () => {
            const user = request.result;
            document.getElementById("loggedOutActions").style.display = "none";
            document.getElementById("loggedInActions").style.display = "block";
            document.getElementById("username").textContent = user.fullName;
            console.log(user);
        };
    }
};