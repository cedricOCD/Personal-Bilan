// ===== GESTION AUTHENTIFICATION =====

const loginForm = document.getElementById('login-form');
const loginBtn = document.getElementById('login-btn');
const errorMessage = document.getElementById('error-message');
const errorText = document.getElementById('error-text');
const successMessage = document.getElementById('success-message');
const successText = document.getElementById('success-text');
const forgotPassword = document.getElementById('forgot-password');
const togglePassword = document.getElementById('toggle-password');

// Toggle affichage mot de passe
togglePassword.addEventListener('click', () => {
    const passwordInput = document.getElementById('password');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        togglePassword.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        togglePassword.textContent = '👁️';
    }
});

// Afficher erreur
function showError(message) {
    errorText.textContent = message;
    errorMessage.style.display = 'block';
    successMessage.style.display = 'none';
}

// Afficher succès
function showSuccess(message) {
    successText.textContent = message;
    successMessage.style.display = 'block';
    errorMessage.style.display = 'none';
}

// Vérifier session existante
async function checkSession() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
        window.location.href = 'dashboard.html';
    }
}

// Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    loginBtn.disabled = true;
    loginBtn.textContent = '⏳ Connexion en cours...';

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        showError('Email ou mot de passe incorrect.');
        loginBtn.disabled = false;
        loginBtn.textContent = '🚀 Se connecter';
    } else {
        showSuccess('Connexion réussie ! Redirection...');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    }
});

// Mot de passe oublié
forgotPassword.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;

    if (!email) {
        showError('Veuillez entrer votre email pour réinitialiser votre mot de passe.');
        return;
    }

    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/index.html'
    });

    if (error) {
        showError('Erreur lors de l\'envoi de l\'email.');
    } else {
        showSuccess('Email de réinitialisation envoyé ! Vérifiez votre boîte mail.');
    }
});

// Vérifier session au chargement
checkSession();
