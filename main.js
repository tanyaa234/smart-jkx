class PersonalCabinet {
    constructor(authSystem) {
        this.authSystem = authSystem;
        this.init();
    }

    init() {
        // Обработчики форм личного кабинета
        document.getElementById('profile-form').addEventListener('submit', (e) => this.handleProfileUpdate(e));
        document.getElementById('meters-form').addEventListener('submit', (e) => this.handleMetersSubmit(e));
        document.getElementById('request-form').addEventListener('submit', (e) => this.handleRequestSubmit(e));

        // Инициализация данных при загрузке
        this.loadInitialData();
    }

    loadInitialData() {
        // Здесь можно загружать дополнительные данные при необходимости
    }

    handleProfileUpdate(e) {
        e.preventDefault();

        const user = this.authSystem.users[this.authSystem.currentUser];
        if (!user) return;

        // Обновляем данные пользователя
        user.name = document.getElementById('profile-name').value;
        user.phone = document.getElementById('profile-phone').value;
        user.address = document.getElementById('profile-address').value;

        this.authSystem.saveUsers();
        this.authSystem.updateUserInterface();
        this.authSystem.showNotification('Профиль успешно обновлен', 'success');
    }

    handleMetersSubmit(e) {
        e.preventDefault();

        const water = document.getElementById('water-meter').value;
        const hotWater = document.getElementById('hot-water-meter').value;
        const electricity = document.getElementById('electricity-meter').value;

        // В реальном приложении здесь была бы отправка на сервер
        this.authSystem.showNotification('Показания счетчиков отправлены', 'success');
        document.getElementById('meters-form').reset();
    }

    handleRequestSubmit(e) {
        e.preventDefault();

        const type = document.getElementById('request-type').value;
        const description = document.getElementById('request-description').value;
        const urgency = document.getElementById('request-urgency').value;

        const user = this.authSystem.users[this.authSystem.currentUser];
        if (!user) return;

        // Создаем новую заявку
        const newRequest = {
            id: Date.now(),
            type: type,
            description: description,
            urgency: urgency,
            status: 'new',
            date: new Date().toISOString(),
            address: user.address
        };

        user.requests.unshift(newRequest);
        this.authSystem.saveUsers();
        this.authSystem.updateUserInterface();

        this.authSystem.showNotification('Заявка успешно создана', 'success');
        document.getElementById('request-form').reset();
        showSection('requests');
    }
}

// Инициализация личного кабинета после авторизации
document.addEventListener('DOMContentLoaded', () => {
    // PersonalCabinet будет инициализирован после авторизации через authSystem
});
