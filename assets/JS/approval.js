// Approval Module
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is manager
    const userRole = localStorage.getItem('role');
    if (userRole !== 'manager') {
        window.location.href = 'dashboard.html';
        return;
    }
    
    // Load leave data
    const leaveData = JSON.parse(localStorage.getItem('leaveApplications')) || [];
    
    // Initialize UI
    updateApprovalStats(leaveData);
    populateApprovalTable(leaveData);
    setupFilters(leaveData);
    
    // Bulk approve button
    document.getElementById('bulkApproveBtn').addEventListener('click', () => {
        const selectedRows = document.querySelectorAll('.approval-checkbox:checked');
        if (selectedRows.length === 0) {
            showToast('Please select leaves to approve', 'error');
            return;
        }
        
        selectedRows.forEach(checkbox => {
            const rowId = checkbox.dataset.id;
            updateLeaveStatus(rowId, 'Approved');
        });
        
        showToast(`Approved ${selectedRows.length} leave requests`, 'success');
        
        // Refresh the table
        setTimeout(() => {
            const updatedData = JSON.parse(localStorage.getItem('leaveApplications')) || [];
            populateApprovalTable(updatedData);
            updateApprovalStats(updatedData);
        }, 500);
    });
    
    // Search functionality
    document.getElementById('approvalSearch').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#approvalTableBody tr');
        
        rows.forEach(row => {
            const rowText = row.textContent.toLowerCase();
            row.style.display = rowText.includes(searchTerm) ? '' : 'none';
        });
    });
});

function updateApprovalStats(leaveData) {
    const totalRequests = leaveData.length;
    const pendingRequests = leaveData.filter(leave => leave.status === 'Pending').length;
    const approvedRequests = leaveData.filter(leave => leave.status === 'Approved').length;
    const rejectedRequests = leaveData.filter(leave => leave.status === 'Rejected').length;
    
    document.getElementById('totalRequests').textContent = totalRequests;
    document.getElementById('pendingRequests').textContent = pendingRequests;
    document.getElementById('approvedRequests').textContent = approvedRequests;
    document.getElementById('rejectedRequests').textContent = rejectedRequests;
}

function populateApprovalTable(leaveData, filter = 'all') {
    const tableBody = document.getElementById('approvalTableBody');
    tableBody.innerHTML = '';
    
    // Filter data
    let filteredData = leaveData;
    if (filter === 'pending') {
        filteredData = leaveData.filter(leave => leave.status === 'Pending');
    } else if (filter === 'approved') {
        filteredData = leaveData.filter(leave => leave.status === 'Approved');
    } else if (filter === 'rejected') {
        filteredData = leaveData.filter(leave => leave.status === 'Rejected');
    }
    
    if (filteredData.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="8" class="no-data">No leave requests found</td>`;
        tableBody.appendChild(row);
        return;
    }
    
    filteredData.forEach((leave, index) => {
        const row = document.createElement('tr');
        row.dataset.id = `${leave.from}-${leave.to}-${leave.name}`;
        row.innerHTML = `
            <td><input type="checkbox" class="approval-checkbox" data-id="${index}"></td>
            <td>${leave.name}</td>
            <td>${leave.type}</td>
            <td>${leave.from} to ${leave.to}</td>
            <td>${calculateLeaveDuration(leave.from, leave.to)} days</td>
            <td>${leave.reason}</td>
            <td><span class="status-badge status-${leave.status.toLowerCase()}">${leave.status}</span></td>
            <td>
                <button class="btn-icon view-btn" data-id="${index}">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-icon approve-btn" data-id="${index}" ${leave.status !== 'Pending' ? 'disabled' : ''}>
                    <i class="fas fa-check"></i>
                </button>
                <button class="btn-icon reject-btn" data-id="${index}" ${leave.status !== 'Pending' ? 'disabled' : ''}>
                    <i class="fas fa-times"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // Add event listeners
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const leaveId = e.currentTarget.dataset.id;
            showLeaveDetails(leaveId);
        });
    });
    
    document.querySelectorAll('.approve-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const leaveId = e.currentTarget.dataset.id;
            updateLeaveStatus(leaveId, 'Approved');
        });
    });
    
    document.querySelectorAll('.reject-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const leaveId = e.currentTarget.dataset.id;
            updateLeaveStatus(leaveId, 'Rejected');
        });
    });
    
    // Select all checkbox
    document.getElementById('selectAll').addEventListener('change', (e) => {
        const checkboxes = document.querySelectorAll('.approval-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = e.target.checked;
        });
    });
}

function setupFilters(leaveData) {
    const filterButtons = document.querySelectorAll('.approval-filters button');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filter the table
            populateApprovalTable(leaveData, button.dataset.filter);
        });
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
    const leave = leaveData[leaveId];
    
    if (!leave) {
        showToast('Leave request not found', 'error');
        return;
    }
    
    // Update modal content
    document.getElementById('modalEmployee').textContent = leave.name;
    document.getElementById('modalType').textContent = leave.type;
    document.getElementById('modalDates').textContent = 
        `${new Date(leave.from).toDateString()} to ${new Date(leave.to).toDateString()}`;
    document.getElementById('modalDuration').textContent = 
        `${calculateLeaveDuration(leave.from, leave.to)} days`;
    document.getElementById('modalReason').textContent = leave.reason;
    document.getElementById('modalDescription').textContent = leave.description || 'No additional details provided';
    
    // Update status badge
    const statusBadge = document.getElementById('modalStatus');
    statusBadge.className = `status-badge status-${leave.status.toLowerCase()}`;
    statusBadge.textContent = leave.status;
    
    // Update action buttons
    document.getElementById('approveBtn').disabled = leave.status !== 'Pending';
    document.getElementById('rejectBtn').disabled = leave.status !== 'Pending';
    
    // Set event listeners for modal buttons
    document.getElementById('approveBtn').onclick = () => {
        updateLeaveStatus(leaveId, 'Approved');
        document.querySelector('.modal').style.display = 'none';
    };
    
    document.getElementById('rejectBtn').onclick = () => {
        updateLeaveStatus(leaveId, 'Rejected');
        document.querySelector('.modal').style.display = 'none';
    };
    
    document.getElementById('requestMoreInfoBtn').onclick = () => {
        showToast('Request for more information sent', 'success');
        document.querySelector('.modal').style.display = 'none';
    };
    
    // Show modal
    document.querySelector('.modal').style.display = 'flex';
    
    // Close modal when clicking outside
    document.querySelector('.modal').addEventListener('click', (e) => {
        if (e.target === document.querySelector('.modal')) {
            document.querySelector('.modal').style.display = 'none';
        }
    });
    
    document.querySelector('.close-modal').addEventListener('click', () => {
        document.querySelector('.modal').style.display = 'none';
    });
}

function updateLeaveStatus(leaveId, newStatus) {
    const leaveData = JSON.parse(localStorage.getItem('leaveApplications')) || [];
    const leave = leaveData[leaveId];
    
    if (!leave) {
        showToast('Leave request not found', 'error');
        return;
    }
    
    // Update status
    leave.status = newStatus;
    leave.processedOn = new Date().toISOString().split('T')[0];
    
    // Save back to localStorage
    localStorage.setItem('leaveApplications', JSON.stringify(leaveData));
    
    // Show success message
    showToast(`Leave request ${newStatus.toLowerCase()} successfully`, 'success');
    
    // Refresh the table
    setTimeout(() => {
        populateApprovalTable(leaveData);
        updateApprovalStats(leaveData);
    }, 500);
}