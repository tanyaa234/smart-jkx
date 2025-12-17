class PersonalCabinet {
    constructor(authSystem) {
        this.authSystem = authSystem;
        this.init();
    }

    init() {
        document.getElementById('profile-form').addEventListener('submit', (e) => this.handleProfileUpdate(e));
        document.getElementById('meters-form').addEventListener('submit', (e) => this.handleMetersSubmit(e));
        document.getElementById('request-form').addEventListener('submit', (e) => this.handleRequestSubmit(e));

        this.loadInitialData();
    }

    loadInitialData() {
    }

    handleProfileUpdate(e) {
        e.preventDefault();

        const user = this.authSystem.users[this.authSystem.currentUser];
        if (!user) return;

        user.name = document.getElementById('profile-name').value;
        user.phone = document.getElementById('profile-phone').value;
        user.address = document.getElementById('profile-address').value;

        this.authSystem.saveUsers();
        this.authSystem.updateUserInterface();
        this.authSystem.showNotification('Ïðîôèëü óñïåøíî îáíîâëåí', 'success');
    }

    handleMetersSubmit(e) {
        e.preventDefault();

        const water = document.getElementById('water-meter').value;
        const hotWater = document.getElementById('hot-water-meter').value;
        const electricity = document.getElementById('electricity-meter').value;
        this.authSystem.showNotification('Ïîêàçàíèÿ ñ÷åò÷èêîâ îòïðàâëåíû', 'success');
        document.getElementById('meters-form').reset();
    }

    handleRequestSubmit(e) {
        e.preventDefault();

        const type = document.getElementById('request-type').value;
        const description = document.getElementById('request-description').value;
        const urgency = document.getElementById('request-urgency').value;

        const user = this.authSystem.users[this.authSystem.currentUser];
        if (!user) return;

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

        this.authSystem.showNotification('Çàÿâêà óñïåøíî ñîçäàíà', 'success');
        document.getElementById('request-form').reset();
        showSection('requests');
    }
}

document.addEventListener('DOMContentLoaded', () => {
});

