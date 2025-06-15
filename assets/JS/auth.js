// Enhanced Authentication Module
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication state
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const currentPage = location.pathname.split('/').pop();
    const publicPages = ['index.html', 'login.html'];
    
    // Redirect if not authenticated
    if (!isLoggedIn && !publicPages.includes(currentPage)) {
        window.location.href = 'login.html';
        return;
    }
    
    // Set user information
    const username = localStorage.getItem('username') || 'User';
    const role = localStorage.getItem('role') || 'employee';
    
    // Update UI elements
    document.querySelectorAll('#sidebarUsername, #usernameDisplay').forEach(el => {
        if (el) el.textContent = username;
    });
    
    document.querySelectorAll('#sidebarRole').forEach(el => {
        if (el) el.textContent = role === 'manager' ? 'Manager' : 'Employee';
    });
    
    // Show/hide manager approval link
    const approvalLink = document.getElementById('approvalLink');
    if (approvalLink) {
        approvalLink.style.display = role === 'manager' ? 'flex' : 'none';
    }
    
    // Theme management
    const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
         const currentTheme = localStorage.getItem('theme') || 'dark';
             document.documentElement.setAttribute('data-theme', currentTheme);
    
        if (currentTheme === 'light') {
             themeToggle.checked = true;
        }
    
    themeToggle.addEventListener('change', function() {
        if (this.checked) {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        }
    });
}   
    
    // Logout functionality
    const logoutButtons = document.querySelectorAll('#logoutBtn');
    logoutButtons.forEach(button => {
        if (button) {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('username');
                localStorage.removeItem('role');
                window.location.href = 'login.html';
            });
        }
    });
    
    // Voice command setup
    if ('webkitSpeechRecognition' in window) {
        const voiceBtn = document.getElementById('voiceBtn');
        if (voiceBtn) {
            const recognition = new webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            
            voiceBtn.addEventListener('click', () => {
                voiceBtn.classList.add('listening');
                recognition.start();
                
                // Show listening indicator
                const toast = document.createElement('div');
                toast.className = 'toast success';
                toast.innerHTML = '<i class="fas fa-microphone"></i> Listening...';
                document.body.appendChild(toast);
                
                setTimeout(() => toast.remove(), 3000);
            });
            
            recognition.onresult = function(event) {
                const command = event.results[0][0].transcript.toLowerCase();
                handleVoiceCommand(command);
            };
            
            recognition.onerror = function(event) {
                console.error('Voice recognition error', event.error);
                voiceBtn.classList.remove('listening');
            };
            
            recognition.onend = function() {
                voiceBtn.classList.remove('listening');
            };
        }
    }
    
    // Voice command handler
    function handleVoiceCommand(command) {
        console.log('Voice command:', command);
        const toast = document.createElement('div');
        toast.className = 'toast success';
        
        if (command.includes('dashboard') || command.includes('home')) {
            window.location.href = 'dashboard.html';
            toast.innerHTML = '<i class="fas fa-home"></i> Navigating to Dashboard';
        } else if (command.includes('apply') || command.includes('leave')) {
            window.location.href = 'applyLeave.html';
            toast.innerHTML = '<i class="fas fa-calendar-plus"></i> Navigating to Apply Leave';
        } else if (command.includes('history') || command.includes('past')) {
            window.location.href = 'leaveHistory.html';
            toast.innerHTML = '<i class="fas fa-history"></i> Navigating to Leave History';
        } else if (command.includes('approve') || command.includes('manager')) {
            window.location.href = 'approval.html';
            toast.innerHTML = '<i class="fas fa-clipboard-check"></i> Navigating to Approvals';
        } else if (command.includes('logout') || command.includes('sign out')) {
            localStorage.removeItem('isLoggedIn');
            window.location.href = 'login.html';
            toast.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logging out';
        } else {
            toast.className = 'toast error';
            toast.innerHTML = '<i class="fas fa-exclamation-circle"></i> Command not recognized';
        }
        
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
});

// Toast notification function
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${message}`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}