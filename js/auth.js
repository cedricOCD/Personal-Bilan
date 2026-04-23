// ===== CORTEX TRACKER - AUTH.JS =====
// Détection réseau + Fallback automatique

// ===== CREDENTIALS FALLBACK (réseau Orange) =====
const FALLBACK_USERS = {
    'hughespascalcedric.lacharmante@orange.com': 'Test1234!'
};

// ===== DÉTECTION RÉSEAU ORANGE =====
async function isSupabaseAccessible() {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000); // 3 secondes max

        const response = await fetch('https://edhsddxdbnlojfwuidcb.supabase.co/auth/v1/health', {
            method: 'GET',
            signal: controller.signal
        });

        clearTimeout(timeout);
        return response.ok;
    } catch (err) {
        // Réseau bloque Supabase (Orange, firewall, etc.)
        return false;
    }
}

// ===== LOGIN VIA SUPABASE =====
async function loginWithSupabase(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) throw error;
    return data.user;
}

// ===== LOGIN VIA FALLBACK LOCAL =====
function loginWithFallback(email, password) {
    if (FALLBACK_USERS[email] && FALLBACK_USERS[email] === password) {
        return { 
            email: email, 
            id: 'local-user',
            fallback: true,
            created_at: new Date().toISOString()
        };
    }
    throw new Error('Email ou mot de passe incorrect.');
}

// ===== AFFICHER MESSAGE =====
function showError(message) {
    const errorBox = document.getElementById('error-message');
    if (errorBox) {
        errorBox.style.display = 'flex';
        errorBox.innerHTML = `<i class="fas fa-triangle-exclamation"></i> ${message}`;
    }
}

function hideError() {
    const errorBox = document.getElementById('error-message');
    if (errorBox) {
        errorBox.style.display = 'none';
    }
}

function showLoading(btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connexion...';
}

function hideLoading(btn) {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-rocket"></i> SE CONNECTER';
}

// ===== VÉRIFIER SESSION EXISTANTE =====
async function checkExistingSession() {
    // Vérifier session Supabase
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session) {
            window.location.href = 'dashboard.html';
            return;
        }
    } catch (err) {
        // Supabase inaccessible
    }

    // Vérifier session locale (fallback Orange)
    const localUser = localStorage.getItem('cortex_user');
    if (localUser) {
        window.location.href = 'dashboard.html';
    }
}

// ===== GESTIONNAIRE PRINCIPAL LOGIN =====
document.addEventListener('DOMContentLoaded', async function () {

    // Vérifier si déjà connecté
    await checkExistingSession();

    // Toggle mot de passe
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function () {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.querySelector('i').classList.toggle('fa-eye');
            this.querySelector('i').classList.toggle('fa-eye-slash');
        });
    }

    // Formulaire login
    const loginForm = document.querySelector('.login-form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const btn = document.querySelector('.btn-primary');

        // Validation basique
        if (!email || !password) {
            showError('Veuillez remplir tous les champs.');
            return;
        }

        hideError();
        showLoading(btn);

        try {
            // ===== ÉTAPE 1 : Tester si Supabase est accessible =====
            const supabaseOk = await isSupabaseAccessible();

            if (supabaseOk) {
                // ===== RÉSEAU NORMAL → Login Supabase =====
                console.log('✅ Réseau normal - Login via Supabase');
                const user = await loginWithSupabase(email, password);
                localStorage.setItem('cortex_user', JSON.stringify({
                    email: user.email,
                    id: user.id,
                    fallback: false
                }));
                window.location.href = 'dashboard.html';

            } else {
                // ===== RÉSEAU ORANGE → Login Fallback =====
                console.log('⚠️ Réseau restreint - Login via fallback local');
                const user = loginWithFallback(email, password);
                localStorage.setItem('cortex_user', JSON.stringify(user));
                window.location.href = 'dashboard.html';
            }

        } catch (err) {
            console.error('Erreur login:', err);
            showError(err.message || 'Email ou mot de passe incorrect.');
            hideLoading(btn);
        }
    });

    // Mot de passe oublié
    const forgotLink = document.querySelector('.forgot-password');
    if (forgotLink) {
        forgotLink.addEventListener('click', async function (e) {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();

            if (!email) {
                showError('Entrez votre email pour réinitialiser le mot de passe.');
                return;
            }

            try {
                const supabaseOk = await isSupabaseAccessible();
                if (!supabaseOk) {
                    showError('Réinitialisation impossible sur réseau restreint. Contactez l\'administrateur.');
                    return;
                }

                const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
                    redirectTo: 'https://cedricocd.github.io/Personal-Bilan/index.html'
                });

                if (error) throw error;

                const errorBox = document.getElementById('error-message');
                if (errorBox) {
                    errorBox.style.display = 'flex';
                    errorBox.style.background = 'rgba(0, 255, 150, 0.1)';
                    errorBox.style.borderColor = 'rgba(0, 255, 150, 0.4)';
                    errorBox.style.color = '#00ff96';
                    errorBox.innerHTML = '<i class="fas fa-check-circle"></i> Email de réinitialisation envoyé !';
                }
            } catch (err) {
                showError('Erreur lors de l\'envoi. Réessayez plus tard.');
            }
        });
    }
});
