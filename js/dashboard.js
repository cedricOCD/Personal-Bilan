// ===== CORTEX TRACKER - DASHBOARD.JS =====

// ===== VÉRIFIER SESSION =====
function checkSession() {
    const user = localStorage.getItem('cortex_user');
    if (!user) {
        window.location.href = 'index.html';
        return null;
    }
    return JSON.parse(user);
}

// ===== AFFICHER INFO USER =====
function displayUserInfo(user) {
    const userName = document.getElementById('userName');
    if (userName) {
        const email = user.email || '';
        const name = email.split('.')[0];
        userName.textContent = name.charAt(0).toUpperCase() + name.slice(1);
    }
}

// ===== AFFICHER DATE =====
function displayDate() {
    const dateEl = document.getElementById('currentDate');
    if (dateEl) {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        dateEl.textContent = now.toLocaleDateString('fr-FR', options);
    }
}

// ===== BADGE RÉSEAU =====
async function checkNetwork() {
    const badge = document.getElementById('networkBadge');
    if (!badge) return;

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        const response = await fetch(
            'https://edhsddxdbnlojfwuidcb.supabase.co/auth/v1/health',
            { method: 'GET', signal: controller.signal }
        );
        clearTimeout(timeout);

        if (response.ok) {
            badge.className = 'network-badge network-ok';
            badge.innerHTML = '<i class="fas fa-circle-check"></i><span>Supabase connecté</span>';
        } else {
            throw new Error();
        }
    } catch {
        badge.className = 'network-badge network-restricted';
        badge.innerHTML = '<i class="fas fa-triangle-exclamation"></i><span>Mode local</span>';
    }
}

// ===== CHARGER STATS =====
async function loadStats() {
    try {
        // Tickets
        const { data: tickets, error: ticketsError } = await supabaseClient
            .from('tickets')
            .select('*');

        if (!ticketsError && tickets) {
            document.getElementById('totalTickets').textContent = tickets.length;
            document.getElementById('openTickets').textContent = 
                tickets.filter(t => t.statut === 'Ouvert').length;
            document.getElementById('progressTickets').textContent = 
                tickets.filter(t => t.statut === 'En traitement').length;
            document.getElementById('closedTickets').textContent = 
                tickets.filter(t => t.statut === 'Fermé').length;
            document.getElementById('urgentTickets').textContent = 
                tickets.filter(t => t.priorite === 'Haute').length;

            // Tickets récents
            const recent = tickets.slice(-5).reverse();
            displayRecentTickets(recent);
        }

        // Appels
        const { data: appels, error: appelsError } = await supabaseClient
            .from('appels')
            .select('*');

        if (!appelsError && appels) {
            document.getElementById('totalCalls').textContent = appels.length;
            const recentCalls = appels.slice(-5).reverse();
            displayRecentCalls(recentCalls);
        }

    } catch (err) {
        console.warn('Supabase inaccessible - Mode local actif');
    }
}

// ===== AFFICHER TICKETS RÉCENTS =====
function displayRecentTickets(tickets) {
    const tbody = document.getElementById('recentTicketsBody');
    if (!tbody || tickets.length === 0) return;

    tbody.innerHTML = tickets.map(ticket => `
        <tr>
            <td><span class="ticket-id">#${ticket.id}</span></td>
            <td>${ticket.titre || '-'}</td>
            <td><span class="badge badge-category">${ticket.categorie || '-'}</span></td>
            <td><span class="badge badge-priority-${(ticket.priorite || '').toLowerCase()}">${ticket.priorite || '-'}</span></td>
            <td><span class="badge badge-status-${(ticket.statut || '').toLowerCase().replace(' ', '-')}">${ticket.statut || '-'}</span></td>
            <td>${ticket.created_at ? new Date(ticket.created_at).toLocaleDateString('fr-FR') : '-'}</td>
        </tr>
    `).join('');
}

// ===== AFFICHER APPELS RÉCENTS =====
function displayRecentCalls(appels) {
    const tbody = document.getElementById('recentCallsBody');
    if (!tbody || appels.length === 0) return;

    tbody.innerHTML = appels.map(appel => `
        <tr>
            <td><span class="ticket-id">#${appel.id}</span></td>
            <td>${appel.client || '-'}</td>
            <td>${appel.numero || '-'}</td>
            <td><span class="badge badge-status-${(appel.statut || '').toLowerCase()}">${appel.statut || '-'}</span></td>
            <td>${appel.duree || '-'}</td>
            <td>${appel.created_at ? new Date(appel.created_at).toLocaleDateString('fr-FR') : '-'}</td>
        </tr>
    `).join('');
}

// ===== SIDEBAR TOGGLE =====
function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
        });
    }

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
        });
    }

    // Fermer sidebar sur mobile en cliquant ailleurs
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            if (!sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                sidebar.classList.remove('mobile-open');
            }
        }
    });
}

// ===== LOGOUT =====
function initLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await supabaseClient.auth.signOut();
            } catch (err) {
                // Mode local
            }
            localStorage.removeItem('cortex_user');
            window.location.href = 'index.html';
        });
    }
}

// ===== INITIALISATION =====
document.addEventListener('DOMContentLoaded', async function () {
    // Vérifier session
    const user = checkSession();
    if (!user) return;

    // Afficher infos
    displayUserInfo(user);
    displayDate();

    // Vérifier réseau
    await checkNetwork();

    // Charger stats
    await loadStats();

    // Initialiser sidebar
    initSidebar();

    // Initialiser logout
    initLogout();
});
