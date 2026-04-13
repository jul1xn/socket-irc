const connectForm = document.getElementById("connect-form");
const usernameInput = document.getElementById("usernameInput");
const passwordInput = document.getElementById("passwordInput");
const guestAccountCheckbox = document.getElementById("guestAccount");

const statusAlertParent = document.getElementById("status-alert-parent");
const statusAlert = document.getElementById("status-alert");

const registerPrompt = document.getElementById("registerPrompt");

guestAccountCheckbox.addEventListener("change", () => {
    passwordInput.disabled = guestAccountCheckbox.checked;
    if (passwordInput.value !== "" && guestAccountCheckbox.checked) {
        passwordInput.value = "";
    }
    
    if (guestAccountCheckbox.checked) {
        registerPrompt.style.display = "none";
    } else {
        registerPrompt.style.display = "block";
    }
});

connectForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    statusAlertParent.style.display = "none";

    accountData = JSON.stringify({
        username: usernameInput.value,
        password: passwordInput.value,
        guest: guestAccountCheckbox.checked
    });

    await fetch("/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: accountData
    }
    ).then(response => {
        if (response.ok) {
            storeAccountData(accountData);
            localStorage.setItem("channel", "irc.general");
            window.location.href = "/chat";
        } else {
            statusAlertParent.style.display = "unset";
            if (response.status === 401) {
                statusAlert.innerText = "Invalid username or password.";
            } else {
                statusAlert.innerText = "An error occurred. Please try again later.";
            }
        }
    });
});