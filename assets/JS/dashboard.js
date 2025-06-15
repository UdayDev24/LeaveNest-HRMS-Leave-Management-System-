// Dashboard Module
document.addEventListener('DOMContentLoaded', () => {
    // Initialize leave data
    const leaveData = JSON.parse(localStorage.getItem('leaveApplications')) || [];
    const userRole = localStorage.getItem('role') || 'employee';
    const username = localStorage.getItem('username') || 'User';
    
    // Update stats
    updateDashboardStats(leaveData, username, userRole);
    
    // Initialize chart
    initLeaveTrendChart(leaveData, username, userRole);
    
    // Populate leave requests table
    populateLeaveRequestsTable(leaveData, username, userRole);
    
    // Quick leave button
    const quickLeaveBtn = document.getElementById('quickLeaveBtn');
    if (quickLeaveBtn) {
        quickLeaveBtn.addEventListener('click', () => {
            // Create a quick leave application for tomorrow
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            const quickLeave = {
                name: username,
                type: 'Casual',
                from: formatDate(tomorrow),
                to: formatDate(tomorrow),
                reason: 'Quick leave',
                status: 'Pending',
                appliedOn: formatDate(new Date())
            };
            
            // Save to localStorage
            const updatedLeaveData = [...leaveData, quickLeave];
            localStorage.setItem('leaveApplications', JSON.stringify(updatedLeaveData));
            
            // Show success message
            showToast('Quick leave applied for tomorrow!', 'success');
            
            // Refresh the table
            setTimeout(() => {
                populateLeaveRequestsTable(updatedLeaveData, username, userRole);
                updateDashboardStats(updatedLeaveData, username, userRole);
            }, 500);
        });
    }
    

     // Add filter button functionality
    document.addEventListener('DOMContentLoaded', () => {

    const filterButtons = document.querySelectorAll('.view-actions button');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Filter the table
            const filter = button.textContent.trim();
            filterLeaveRequests(filter);
        });
    });
});

function filterLeaveRequests(filter) {
    const leaveData = JSON.parse(localStorage.getItem('leaveApplications')) || [];
    const username = localStorage.getItem('username') || 'User';
    const userRole = localStorage.getItem('role') || 'employee';
    
    let filteredData = leaveData;
    
    if (userRole !== 'manager') {
        filteredData = filteredData.filter(leave => leave.name === username);
    }
    
    if (filter === 'Pending') {
        filteredData = filteredData.filter(leave => leave.status === 'Pending');
    } else if (filter === 'Approved') {
        filteredData = filteredData.filter(leave => leave.status === 'Approved');
    }
    // 'All' shows all data
    
    populateLeaveRequestsTable(filteredData, username, userRole);
}

});

function updateDashboardStats(leaveData, username, userRole) {
    // Filter leaves based on user role
    const userLeaves = userRole === 'manager' 
        ? leaveData 
        : leaveData.filter(leave => leave.name === username);
    
    // Calculate stats
    const totalLeaves = userLeaves.length;
    const pendingLeaves = userLeaves.filter(leave => leave.status === 'Pending').length;
    const approvedLeaves = userLeaves.filter(leave => leave.status === 'Approved').length;
    
    // Update UI
    document.getElementById('totalLeaves').textContent = totalLeaves;
    document.getElementById('pendingLeaves').textContent = pendingLeaves;
    document.getElementById('approvedLeaves').textContent = approvedLeaves;
    
    // Update leave balance (assuming 20 annual leaves)
    if (userRole !== 'manager') {
        const leaveBalance = 20 - approvedLeaves;
        document.getElementById('leaveBalance').textContent = leaveBalance > 0 ? leaveBalance : 0;
    }
}

function initLeaveTrendChart(leaveData, username, userRole) {
    const ctx = document.getElementById('leaveTrendChart').getContext('2d');
    
    // Filter and process data for the chart
    const filteredData = userRole === 'manager' 
        ? leaveData 
        : leaveData.filter(leave => leave.name === username);
    
    // Group by month
    const monthlyData = Array(12).fill(0);
    filteredData.forEach(leave => {
        if (leave.status === 'Approved') {
            const month = new Date(leave.from).getMonth();
            monthlyData[month]++;
        }
    });
    
    // Create chart
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Leaves Taken',
                data: monthlyData,
                borderColor: '#4361ee',
                backgroundColor: 'rgba(67, 97, 238, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                }
            }
        }
    });
}

function populateLeaveRequestsTable(leaveData, username, userRole) {
    const tableBody = document.getElementById('leaveRequestsTable');
    tableBody.innerHTML = '';
    
    // Filter data based on user role
    const filteredData = userRole === 'manager' 
        ? leaveData.slice(0, 5) // Show only 5 most recent for manager
        : leaveData.filter(leave => leave.name === username).slice(0, 5);
    
    if (filteredData.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="6" class="no-data">No leave requests found</td>`;
        tableBody.appendChild(row);
        return;
    }
    
    filteredData.forEach(leave => {
        const row = document.createElement('tr');
        row.className = 'leave-row';
        row.innerHTML = `
            <td>${leave.name}</td>
            <td>${leave.type}</td>
            <td>${leave.from} to ${leave.to}</td>
            <td>${calculateLeaveDuration(leave.from, leave.to)} days</td>
            <td><span class="status-badge status-${leave.status.toLowerCase()}">${leave.status}</span></td>
            <td>
                <button class="btn-icon view-btn" data-id="${leave.from}-${leave.to}">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // Add event listeners to view buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // In a real app, this would show more details
            showToast('Viewing leave details', 'success');
        });
    });
}

function calculateLeaveDuration(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

