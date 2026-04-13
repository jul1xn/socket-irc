const usernameInput = document.getElementById('usernameInput');
const colorInput = document.getElementById('colorInput');
const registerForm = document.getElementById('connect-form');
const statusAlertParent = document.getElementById('status-alert-parent');
const statusAlert = document.getElementById('status-alert');
const passwordInput = document.getElementById('passwordInput');
const confirmPasswordInput = document.getElementById('confirmPasswordInput');
let interacted = false;

usernameInput.addEventListener('input', () => {
    if (usernameInput.value.trim() !== '' && !interacted) {
        var color = stringToColour(usernameInput.value.trim());
        usernameInput.style.color = color;
        colorInput.value = color;
    }
});
colorInput.addEventListener('focus', () => {
    interacted = true;
});
colorInput.addEventListener('input', () => {
    usernameInput.style.color = colorInput.value;
    colorInput.value = colorInput.value;
});

registerForm.addEventListener('submit', (e) => {
    statusAlertParent.style.display = 'none';
    
    if (passwordInput.value !== confirmPasswordInput.value) {
        e.preventDefault();
        statusAlertParent.style.display = 'block';
        statusAlert.innerText = "Passwords do not match.";
    }
});