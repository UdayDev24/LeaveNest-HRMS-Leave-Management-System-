// Apply Leave Module
document.addEventListener('DOMContentLoaded', () => {
    // Initialize date pickers
    flatpickr("#startDate", {
        minDate: "today",
        dateFormat: "Y-m-d",
        onChange: updateLeavePreview
    });
    
    flatpickr("#endDate", {
        minDate: "today",
        dateFormat: "Y-m-d",
        onChange: updateLeavePreview
    });
    
    // Initialize form elements
    const leaveForm = document.getElementById('leaveForm');
    const leaveType = document.getElementById('leaveType');
    const leaveReason = document.getElementById('leaveReason');
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    const leaveDescription = document.getElementById('leaveDescription');
    
    // Set initial preview values
    document.getElementById('previewUsername').textContent = localStorage.getItem('username') || 'User';
    updateLeavePreview();
    
    // Add event listeners for real-time preview
    leaveType.addEventListener('change', updateLeavePreview);
    leaveReason.addEventListener('input', updateLeavePreview);
    leaveDescription.addEventListener('input', updateLeavePreview);
    
    // Form submission
    leaveForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate dates
        if (new Date(endDate.value) < new Date(startDate.value)) {
            showToast('End date cannot be before start date', 'error');
            return;
        }
        
        // Create leave object
        const newLeave = {
            name: localStorage.getItem('username') || 'User',
            type: leaveType.value,
            from: startDate.value,
            to: endDate.value,
            reason: leaveReason.value,
            description: leaveDescription.value,
            status: 'Pending',
            appliedOn: new Date().toISOString().split('T')[0]
        };
        
        // Save to localStorage
        const leaveData = JSON.parse(localStorage.getItem('leaveApplications')) || [];
        leaveData.push(newLeave);
        localStorage.setItem('leaveApplications', JSON.stringify(leaveData));
        
        // Show success message
        showToast('Leave application submitted successfully!', 'success');
        
        // Redirect to dashboard after delay
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    });
    
    // Save as draft functionality
    document.getElementById('draftBtn').addEventListener('click', function() {
        if (!leaveType.value || !startDate.value || !endDate.value) {
            showToast('Please fill required fields before saving as draft', 'error');
            return;
        }
        
        // In a real app, you would save to drafts
        showToast('Draft saved successfully!', 'success');
    });
    
    // Initialize team calendar
    initTeamCalendar();
});

function updateLeavePreview() {
    const leaveType = document.getElementById('leaveType');
    const leaveReason = document.getElementById('leaveReason');
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    const leaveDescription = document.getElementById('leaveDescription');
    
    // Update preview elements
    document.getElementById('previewType').textContent = leaveType.value || '-';
    document.getElementById('previewReason').textContent = leaveReason.value || 'No reason provided yet';
    
    if (startDate.value && endDate.value) {
        const start = new Date(startDate.value);
        const end = new Date(endDate.value);
        const duration = calculateLeaveDuration(startDate.value, endDate.value);
        
        document.getElementById('previewDates').textContent = 
            `${start.toDateString()} to ${end.toDateString()}`;
        document.getElementById('previewDuration').textContent = 
            `${duration} day${duration > 1 ? 's' : ''}`;
    } else {
        document.getElementById('previewDates').textContent = '-';
        document.getElementById('previewDuration').textContent = '-';
    }
    
    // Update preview date (submission date)
    document.getElementById('previewDate').textContent = 'Today';
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

function initTeamCalendar() {
    // In a real app, this would fetch team leave data
    // For demo, we'll simulate some data
    const teamLeaves = [
        { name: 'Alice', from: '2025-06-05', to: '2025-06-07', type: 'Casual' },
        { name: 'Bob', from: '2025-06-10', to: '2025-06-15', type: 'Medical' },
        { name: 'Charlie', from: '2025-06-20', to: '2025-06-25', type: 'Annual' }
    ];
    
    const calendarContainer = document.getElementById('teamCalendar');
    calendarContainer.innerHTML = '';
    
    // Create a simple calendar visualization
    const daysInMonth = 30; // June has 30 days
    const calendarGrid = document.createElement('div');
    calendarGrid.className = 'calendar-grid';
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `2025-06-${day < 10 ? '0' + day : day}`;
        const dateCell = document.createElement('div');
        dateCell.className = 'calendar-day';
        dateCell.textContent = day;
        
        // Check if anyone is on leave this day
        const isOnLeave = teamLeaves.some(leave => 
            new Date(dateStr) >= new Date(leave.from) && 
            new Date(dateStr) <= new Date(leave.to)
        );
        
        if (isOnLeave) {
            dateCell.classList.add('on-leave');
        }
        
        // Highlight selected dates
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        
        if (startDate && endDate && 
            new Date(dateStr) >= new Date(startDate) && 
            new Date(dateStr) <= new Date(endDate)) {
            dateCell.classList.add('selected');
        }
        
        calendarGrid.appendChild(dateCell);
    }
    
    calendarContainer.appendChild(calendarGrid);
}