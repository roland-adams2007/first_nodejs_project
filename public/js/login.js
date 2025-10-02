const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
const eyeIcon = document.getElementById('eyeIcon');

togglePassword.addEventListener('click', function () {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);

    if (type === 'text') {
        eyeIcon.innerHTML = '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/>';
    } else {
        eyeIcon.innerHTML = '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>';
    }
});

// Form submission
document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const submitBtn = document.getElementById('submitBtn');
    const lastBtnContent = submitBtn.innerHTML;



    if (!email) {
        alert('Email is reauired');
        return;
    }

    if (!password) {
        alert('password is required');
        return;

    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `
    <svg class="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
    </svg>
    `;
    const payload = { email, password };

    fetch("/api/users/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })
        .then(response => response.json())
        .then(res => {
            const { status, data, message } = res;
            if (status != 200) {
                alert(message || 'Login failed');
                return;
            }
            email.value = "";
            password.value = "";
            if (data.accessToken) {
                document.cookie = `t_accessToken=${data.accessToken}; path=/; max-age=${60 * 60 * 24 * 7}`;
                alert(message || "Login successful!");
                window.location.href = "/dashboard";
            } else {
                alert("Something went wrong, Login again");
            }
        })

        .catch(error => {
            alert("Something went wrong");
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = lastBtnContent;
        });

});