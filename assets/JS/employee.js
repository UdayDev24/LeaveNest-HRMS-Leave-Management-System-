document.getElementById("leaveForm").addEventListener("submit", function (e) {
    e.preventDefault();
  
    const name = document.getElementById("name").value.trim();
    const type = document.getElementById("type").value;
    const from = document.getElementById("from").value;
    const to = document.getElementById("to").value;
    const reason = document.getElementById("reason").value.trim();
  
    if (!name || !type || !from || !to || !reason) {
      alert("Please fill all fields.");
      return;
    }
  
    const leaveApplications = JSON.parse(localStorage.getItem("leaveApplications")) || [];
  
    leaveApplications.push({
      name,
      type,
      from,
      to,
      reason,
      status: "Pending"
    });
  
    localStorage.setItem("leaveApplications", JSON.stringify(leaveApplications));
    alert("Leave applied successfully!");
    window.location.href = "leaveHistory.html";
  });
  