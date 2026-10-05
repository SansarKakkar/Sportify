let login=(event)=>{
    event.preventDefault();
    try{
        const email = document.getElementById("email");
        const password = document.getElementById("password");
        console.log(email.value);
        console.log(password.value);
        const dbRequest = indexedDB.open("SportifyDB", 3);
        dbRequest.onsuccess = () => {

            console.log("Database opened successfully");

            const db = dbRequest.result;
            console.log(db.name);
            console.log(db.version);
            console.log(db.objectStoreNames);

            const transaction = db.transaction("users", "readonly");

            const userStore = transaction.objectStore("users");

            console.log("Users object store opened");
            const emailIndex = userStore.index("email");

            const request = emailIndex.get(email.value.trim().toLowerCase());
            request.onsuccess = () => {

                const user = request.result;
                if (user && user.password === password.value) {
                    localStorage.setItem("currentUserId", user.id);
                    window.location.href = "../index.html";
                    console.log(user);
                }
                else {
                    throw new Error("Credentials are wrong");
                }
            };
        };
    }
    catch(err){
        console.error(err.message);
        alert(err.message);
    }
};
const logout = () => {
    try{
        localStorage.removeItem("currentUserId");
    }
    catch(err){
        console.log("please login");
    }
};