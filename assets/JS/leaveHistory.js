// Leave History Module
document.addEventListener('DOMContentLoaded', () => {
    // Load leave data
    const leaveData = JSON.parse(localStorage.getItem('leaveApplications')) || [];
    const username = localStorage.getItem('username');
    const userRole = localStorage.getItem('role');
    
    // Filter leaves for current user (unless manager)
    const userLeaves = userRole === 'manager' 
        ? leaveData 
        : leaveData.filter(leave => leave.name === username);
    
    // Initialize UI
    updateHistoryStats(userLeaves);
    initHistoryChart(userLeaves);
    populateHistoryTable(userLeaves);
    setupHistoryFilters(userLeaves);
    
    // Print button
    document.getElementById('printLeaveBtn').addEventListener('click', () => {
        window.print();
    });
    
    // Close detail modal
    document.getElementById('closeDetailBtn').addEventListener('click', () => {
        document.getElementById('leaveDetailModal').style.display = 'none';
    });
    
    // Close modal when clicking outside
    document.getElementById('leaveDetailModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('leaveDetailModal')) {
            document.getElementById('leaveDetailModal').style.display = 'none';
        }
    });
});

function updateHistoryStats(leaveData) {
    const totalLeavesTaken = leaveData.filter(leave => leave.status === 'Approved').length;
    const leavesRemaining = Math.max(20 - totalLeavesTaken, 0); // Assuming 20 annual leaves
    const approvalRate = leaveData.length > 0 
        ? Math.round((leaveData.filter(leave => leave.status === 'Approved').length / leaveData.length) * 100) 
        : 0;
    
    // Calculate average leave duration
    const approvedLeaves = leaveData.filter(leave => leave.status === 'Approved');
    const totalDays = approvedLeaves.reduce((sum, leave) => {
        return sum + calculateLeaveDuration(leave.from, leave.to);
    }, 0);
    const avgLeaveLength = approvedLeaves.length > 0 
        ? (totalDays / approvedLeaves.length).toFixed(1) 
        : 0;
    
    // Update UI
    document.getElementById('totalLeavesTaken').textContent = totalLeavesTaken;
    document.getElementById('leavesRemaining').textContent = leavesRemaining;
    document.getElementById('approvalRate').textContent = `${approvalRate}%`;
    document.getElementById('avgLeaveLength').textContent = avgLeaveLength;
}

function initHistoryChart(leaveData) {
    const ctx = document.getElementById('leaveHistoryChart').getContext('2d');
    
    // Group by leave type
    const leaveTypes = ['Casual', 'Sick', 'Medical', 'Annual', 'Other'];
    const typeCounts = leaveTypes.map(type => 
        leaveData.filter(leave => leave.type.toLowerCase().includes(type.toLowerCase())).length
    );
    
    // Create chart
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: leaveTypes,
            datasets: [{
                data: typeCounts,
                backgroundColor: [
                    'rgba(67, 97, 238, 0.8)',
                    'rgba(76, 201, 240, 0.8)',
                    'rgba(247, 37, 133, 0.8)',
                    'rgba(106, 76, 147, 0.8)',
                    'rgba(255, 159, 64, 0.8)'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                }
            },
            cutout: '70%'
        }
    });
}

function populateHistoryTable(leaveData, yearFilter = 'all', typeFilter = 'all', statusFilter = 'all') {
    const tableBody = document.getElementById('historyTableBody');
    tableBody.innerHTML = '';
    
    // Apply filters
    let filteredData = leaveData;
    
    if (yearFilter !== 'all') {
        filteredData = filteredData.filter(leave => 
            new Date(leave.from).getFullYear().toString() === yearFilter ||
            new Date(leave.to).getFullYear().toString() === yearFilter
        );
    }
    
    if (typeFilter !== 'all') {
        filteredData = filteredData.filter(leave => 
            leave.type.toLowerCase().includes(typeFilter.toLowerCase())
        );
    }
    
    if (statusFilter !== 'all') {
        filteredData = filteredData.filter(leave => 
            leave.status.toLowerCase() === statusFilter.toLowerCase()
        );
    }
    
    if (filteredData.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="6" class="no-data">No leave history found</td>`;
        tableBody.appendChild(row);
        return;
    }
    
    // Sort by date (newest first)
    filteredData.sort((a, b) => new Date(b.from) - new Date(a.from));
    
    // Show only first 10 items (pagination would handle more)
    filteredData.slice(0, 10).forEach(leave => {
        const row = document.createElement('tr');
        row.className = 'history-row';
        row.dataset.id = `${leave.from}-${leave.to}-${leave.name}`;
        row.innerHTML = `
            <td>${leave.type}</td>
            <td>${new Date(leave.from).toDateString()} to ${new Date(leave.to).toDateString()}</td>
            <td>${calculateLeaveDuration(leave.from, leave.to)} days</td>
            <td>${leave.reason}</td>
            <td><span class="status-badge status-${leave.status.toLowerCase()}">${leave.status}</span></td>
            <td>
                <button class="btn-icon view-detail-btn" data-id="${leave.from}-${leave.to}-${leave.name}">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // Add event listeners to view buttons
    document.querySelectorAll('.view-detail-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const leaveId = e.currentTarget.dataset.id;
            showLeaveDetails(leaveId);
        });
    });
}

function setupHistoryFilters(leaveData) {
    // Year filter
    document.getElementById('yearFilter').addEventListener('change', (e) => {
        const yearFilter = e.target.value;
        const typeFilter = document.getElementById('typeFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;
        populateHistoryTable(leaveData, yearFilter, typeFilter, statusFilter);
    });
    
    // Type filter
    document.getElementById('typeFilter').addEventListener('change', (e) => {
        const typeFilter = e.target.value;
        const yearFilter = document.getElementById('yearFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;
        populateHistoryTable(leaveData, yearFilter, typeFilter, statusFilter);
    });
    
    // Status filter
    document.getElementById('statusFilter').addEventListener('change', (e) => {
        const statusFilter = e.target.value;
        const yearFilter = document.getElementById('yearFilter').value;
        const typeFilter = document.getElementById('typeFilter').value;
        populateHistoryTable(leaveData, yearFilter, typeFilter, statusFilter);
    });
}

function calculateLeaveDuration(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
}

function showLeaveDetails(leaveId) {
    const leaveData = JSON.parse(localStorage.getItem('leaveApplications')) || [];
    const leave = leaveData.find(l => 
        `${l.from}-${l.to}-${l.name}` === leaveId
    );
    
    if (!leave) {
        showToast('Leave details not found', 'error');
        return;
    }
    
    // Update modal content
    document.getElementById('detailType').textContent = leave.type;
    document.getElementById('detailDates').textContent = 
        `${new Date(leave.from).toDateString()} to ${new Date(leave.to).toDateString()}`;
    document.getElementById('detailDuration').textContent = 
        `${calculateLeaveDuration(leave.from, leave.to)} days`;
    document.getElementById('detailStatus').textContent = leave.status;
    document.getElementById('detailStatus').className = `status-badge status-${leave.status.toLowerCase()}`;
    document.getElementById('detailApplied').textContent = 
        new Date(leave.appliedOn).toDateString();
    document.getElementById('detailProcessed').textContent = 
        leave.processedOn ? new Date(leave.processedOn).toDateString() : 'Not processed';
    document.getElementById('detailReason').textContent = leave.reason;
    document.getElementById('detailDescription').textContent = 
        leave.description || 'No additional details provided';
    
    // Show/hide manager comments
    const commentsContainer = document.getElementById('managerCommentsContainer');
    if (leave.status === 'Approved' || leave.status === 'Rejected') {
        commentsContainer.style.display = 'block';
        document.getElementById('managerComments').textContent = 
            leave.comments || `Leave ${leave.status.toLowerCase()} by manager`;
    } else {
        commentsContainer.style.display = 'none';
    }
    
    // Show modal
    document.getElementById('leaveDetailModal').style.display = 'flex';
}