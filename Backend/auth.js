const signUp = (event) => {

    event.preventDefault();

    try {

        console.log("inside try");

        const fullName = document.getElementById("fullName");
        const email = document.getElementById("email");
        const phone = document.getElementById("phone");
        const password = document.getElementById("password");
        const confirmPassword = document.getElementById("confirmPassword");

        if (fullName.value.trim() === "") {
            throw new Error("Please provide a name");
        }

        if (email.value.trim() === "") {
            throw new Error("Please provide an email");
        }

        if (password.value === "") {
            throw new Error("Please provide a password");
        }

        if (confirmPassword.value === "") {
            throw new Error("Please confirm your password");
        }

        if (password.value !== confirmPassword.value) {
            throw new Error("Passwords should be the same");
        }

        const user = {
            fullName: fullName.value.trim(),
            email: email.value.trim().toLowerCase(),
            phone: phone.value.trim(),
            password: password.value,
            createdAt: Date.now()
        };

        console.log("before");

        const dbRequest = indexedDB.open("SportifyDB", 1);

        dbRequest.onupgradeneeded = (event) => {

            console.log("Database upgrade needed");

            const db = event.target.result;

            if (!db.objectStoreNames.contains("users")) {

                const userStore = db.createObjectStore("users", {
                    keyPath: "id",
                    autoIncrement: true
                });

                userStore.createIndex("email", "email", {
                    unique: true
                });

                console.log("Users object store created");
            }
        };

        dbRequest.onsuccess = () => {

            console.log("inside db");

            const db = dbRequest.result;

            const transaction = db.transaction(
                "users",
                "readwrite"
            );

            console.log("Transaction created");

            const userStore = transaction.objectStore("users");

            console.log("Got users object store");

            const request = userStore.add(user);

            console.log("Add request created");

            request.onsuccess = () => {

                console.log("USER ADDED SUCCESSFULLY");
                console.log(user);

                alert("Account created successfully!");

                window.location.href = "./login.html";
            };

            request.onerror = () => {

                console.log("USER ADD FAILED");
                console.log(request.error);

                if (request.error.name === "ConstraintError") {

                    console.error(
                        "An account with this email already exists."
                    );

                    alert(
                        "An account with this email already exists."
                    );

                } else {

                    console.error(
                        "Unable to create account"
                    );

                    alert(
                        "Something went wrong. Please try again."
                    );
                }
            };
        };


        dbRequest.onerror = () => {

            console.error(
                "Unable to open Sportify database"
            );

            console.error(dbRequest.error);

            alert(
                "Unable to open database. Please try again."
            );
        };


        console.log("after");

    } catch (err) {

        console.error(err.message);

        alert(err.message);
    }
};

const signupForm = document.getElementById("signupForm");

if (signupForm) {

    signupForm.addEventListener(
        "submit",
        signUp
    );
}
