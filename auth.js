class AuthSystem {
    constructor() {
        this.users = this.loadUsers();
        this.currentUser = this.loadCurrentUser();
        this.init();
    }

    init() {
        if (this.currentUser) {
            this.showPersonalCabinet();
        } else {
            this.showAuthForms();
        }

        document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('register-form').addEventListener('submit', (e) => this.handleRegister(e));
    }

    loadUsers() {
        const users = localStorage.getItem('jkh_users');
        return users ? JSON.parse(users) : {};
    }

    saveUsers() {
        localStorage.setItem('jkh_users', JSON.stringify(this.users));
    }

    loadCurrentUser() {
        return localStorage.getItem('jkh_current_user');
    }

    saveCurrentUser(email) {
        if (email) {
            localStorage.setItem('jkh_current_user', email);
        } else {
            localStorage.removeItem('jkh_current_user');
        }
    }

    showAuthForms() {
        document.getElementById('auth-container').style.display = 'flex';
        document.getElementById('personal-container').style.display = 'none';
    }

    showPersonalCabinet() {
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('personal-container').style.display = 'block';
        this.updateUserInterface();
    }

    handleLogin(e) {
        e.preventDefault();

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        if (this.authenticateUser(email, password)) {
            this.currentUser = email;
            this.saveCurrentUser(email);
            this.showPersonalCabinet();
            this.showNotification('Вход выполнен успешно!', 'success');
        } else {
            this.showNotification('Неверный email или пароль', 'error');
        }
    }

    handleRegister(e) {
        e.preventDefault();

        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const phone = document.getElementById('register-phone').value;
        const address = document.getElementById('register-address').value;
        const password = document.getElementById('register-password').value;
        const confirm = document.getElementById('register-confirm').value;

        if (password !== confirm) {
            this.showNotification('Пароли не совпадают', 'error');
            return;
        }

        if (this.users[email]) {
            this.showNotification('Пользователь с таким email уже существует', 'error');
            return;
        }

        this.users[email] = {
            name: name,
            email: email,
            phone: phone,
            address: address,
            password: password, // В реальном приложении пароль должен хэшироваться
            registrationDate: new Date().toISOString(),
            payments: this.generateSamplePayments(),
            requests: []
        };

        this.saveUsers();
        this.showNotification('Регистрация прошла успешно!', 'success');
        this.showAuthTab('login');
        document.getElementById('register-form').reset();
    }

    authenticateUser(email, password) {
        const user = this.users[email];
        return user && user.password === password;
    }

    logout() {
        this.currentUser = null;
        this.saveCurrentUser(null);
        this.showAuthForms();
        this.showNotification('Вы вышли из системы', 'info');
    }

    updateUserInterface() {
        if (!this.currentUser) return;

        const user = this.users[this.currentUser];
        if (!user) return;


        document.getElementById('user-greeting').textContent = `Добро пожаловать, ${user.name}!`;

        document.getElementById('profile-name').value = user.name;
        document.getElementById('profile-email').value = user.email;
        document.getElementById('profile-phone').value = user.phone;
        document.getElementById('profile-address').value = user.address;

        this.updatePaymentsTable(user.payments);

        this.updateRequestsList(user.requests);

        this.updateDashboard(user);
    }

    updateDashboard(user) {
        const totalDebt = user.payments
            .filter(p => p.status === 'unpaid')
            .reduce((sum, p) => sum + p.amount, 0);

        const nextPayment = user.payments
            .find(p => p.status === 'unpaid');

        const activeRequests = user.requests
            .filter(r => r.status === 'in_progress').length;

        document.getElementById('current-debt').textContent = `${totalDebt} ₽`;
        document.getElementById('next-payment').textContent = nextPayment ? `${nextPayment.amount} ₽` : '0 ₽';
        document.getElementById('active-requests').textContent = activeRequests;
    }

    updatePaymentsTable(payments) {
        const tbody = document.getElementById('payments-body');
        tbody.innerHTML = '';

        payments.forEach(payment => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${payment.period}</td>
                <td>${payment.amount} ₽</td>
                <td class="status-${payment.status}">${payment.status === 'paid' ? 'Оплачено' : 'Не оплачено'}</td>
                <td>${payment.paidDate || '-'}</td>
            `;
            tbody.appendChild(row);
        });
    }

    updateRequestsList(requests) {
        const container = document.getElementById('requests-list');

        if (requests.length === 0) {
            container.innerHTML = '<p>У вас пока нет заявок</p>';
            return;
        }

        container.innerHTML = requests.map(request => `
            <div class="news-card">
                <div class="news-date">${new Date(request.date).toLocaleDateString()}</div>
                <h3>${this.getRequestTypeText(request.type)}</h3>
                <p>${request.description}</p>
                <p><strong>Статус:</strong> ${this.getRequestStatusText(request.status)}</p>
            </div>
        `).join('');
    }

    getRequestTypeText(type) {
        const types = {
            'plumbing': 'Сантехника',
            'electricity': 'Электрика',
            'heating': 'Отопление',
            'cleaning': 'Уборка',
            'other': 'Другое'
        };
        return types[type] || type;
    }

    getRequestStatusText(status) {
        const statuses = {
            'new': 'Новая',
            'in_progress': 'В работе',
            'completed': 'Завершена',
            'cancelled': 'Отменена'
        };
        return statuses[status] || status;
    }

    generateSamplePayments() {
        const payments = [];
        const currentDate = new Date();

        for (let i = 0; i < 6; i++) {
            const date = new Date(currentDate);
            date.setMonth(date.getMonth() - i);

            payments.push({
                period: `${date.getMonth() + 1}.${date.getFullYear()}`,
                amount: Math.floor(Math.random() * 5000) + 2000,
                status: i === 0 ? 'unpaid' : 'paid',
                paidDate: i === 0 ? null : this.formatDate(new Date(date.setDate(date.getDate() + 5)))
            });
        }

        return payments;
    }

    formatDate(date) {
        return date.toLocaleDateString('ru-RU');
    }

    showNotification(message, type = 'info') {
        // Создаем уведомление
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        // Стили для уведомления
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 10000;
        `;

        document.body.appendChild(notification);

        // Удаляем уведомление через 3 секунды
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

function showAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.style.display = 'none');

    document.querySelector(`.auth-tab[onclick="showAuthTab('${tab}')"]`).classList.add('active');
    document.getElementById(`${tab}-form`).style.display = 'block';
}

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));

    document.getElementById(sectionId).classList.add('active');
    event.target.classList.add('active');
}

function logout() {
    authSystem.logout();
}

let authSystem;
document.addEventListener('DOMContentLoaded', () => {
    authSystem = new AuthSystem();
});

