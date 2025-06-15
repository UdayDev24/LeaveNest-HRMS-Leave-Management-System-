document.addEventListener("DOMContentLoaded", () => {
    const leaveData = JSON.parse(localStorage.getItem("leaveApplications")) || [];
  
    const pendingLeavesTable = document.getElementById("pendingLeavesTable");
  
    leaveData.forEach((leave, index) => {
      if (leave.status === "Pending") {
        const row = document.createElement("tr");
  
        row.innerHTML = `
          <td>${leave.name}</td>
          <td>${leave.type}</td>
          <td>${leave.from}</td>
          <td>${leave.to}</td>
          <td>${leave.reason}</td>
          <td id="status-${index}">${leave.status}</td>
          <td>
            <button onclick="updateStatus(${index}, 'Approved')">Approve</button>
            <button onclick="updateStatus(${index}, 'Rejected')">Reject</button>
          </td>
        `;
  
        pendingLeavesTable.appendChild(row);
      }
    });
  });
  
  function updateStatus(index, newStatus) {
    const leaveData = JSON.parse(localStorage.getItem("leaveApplications")) || [];
    leaveData[index].status = newStatus;
    localStorage.setItem("leaveApplications", JSON.stringify(leaveData));
    document.getElementById(`status-${index}`).innerText = newStatus;
  }
  