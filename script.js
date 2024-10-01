document.getElementById('solve-btn').addEventListener('click', function() {
    const arrivalTimes = document.getElementById('arrival-times').value.trim().split(' ').map(Number);
    const burstTimes = document.getElementById('burst-times').value.trim().split(' ').map(Number);
    
    if (arrivalTimes.length !== burstTimes.length) {
        alert("Arrival times and burst times must have the same number of values.");
        return;
    }

    // Hide placeholder and show the output sections
    document.getElementById('output-placeholder').style.display = 'none';
    document.querySelector('.gantt-chart').style.display = 'block';
    document.getElementById('output-table').style.display = 'table';
    document.querySelector('.average-times').style.display = 'block';

    const numJobs = arrivalTimes.length;
    let remainingTimes = [...burstTimes];  // Remaining burst times
    let finishTimes = Array(numJobs).fill(0);
    let waitingTimes = Array(numJobs).fill(0);
    let turnaroundTimes = Array(numJobs).fill(0);
    let completed = 0;
    let currentTime = 0;
    let ganttChart = [];
    let totalBurstTime = burstTimes.reduce((a, b) => a + b, 0);  // Total burst time (CPU busy time)

    let currentJob = -1;
    let minRemainingTime;
    let prevJob = null;

    // Loop until all processes are completed
    while (completed < numJobs) {
        minRemainingTime = Infinity;
        for (let i = 0; i < numJobs; i++) {
            if (arrivalTimes[i] <= currentTime && remainingTimes[i] > 0 && remainingTimes[i] < minRemainingTime) {
                minRemainingTime = remainingTimes[i];
                currentJob = i;
            }
        }

        // If a job is found
        if (currentJob !== -1) {
            if (prevJob !== currentJob) {
                ganttChart.push(`Job ${String.fromCharCode(65 + currentJob)}`);
                prevJob = currentJob;
            }

            remainingTimes[currentJob]--;  // Reduce the remaining time of the current job

            // If a process finishes
            if (remainingTimes[currentJob] === 0) {
                finishTimes[currentJob] = currentTime + 1;
                turnaroundTimes[currentJob] = finishTimes[currentJob] - arrivalTimes[currentJob];
                waitingTimes[currentJob] = turnaroundTimes[currentJob] - burstTimes[currentJob];
                completed++;
            }
        }

        currentTime++;
    }

    // Populate the Gantt Chart
    let ganttDiv = document.getElementById('gantt');
    ganttDiv.innerHTML = '';  // Clear any previous content
    ganttChart.forEach(job => {
        let div = document.createElement('div');
        div.innerText = job;
        ganttDiv.appendChild(div);
    });

    // Populate the Output Table
    const tableBody = document.querySelector('#output-table tbody');
    tableBody.innerHTML = '';  // Clear any previous results
    let totalTurnaround = 0;
    let totalWaiting = 0;

    for (let i = 0; i < numJobs; i++) {
        const row = `
            <tr>
                <td>${String.fromCharCode(65 + i)}</td>
                <td>${arrivalTimes[i]}</td>
                <td>${burstTimes[i]}</td>
                <td>${finishTimes[i]}</td>
                <td>${turnaroundTimes[i]}</td>
                <td>${waitingTimes[i]}</td>
            </tr>
        `;
        totalTurnaround += turnaroundTimes[i];
        totalWaiting += waitingTimes[i];
        tableBody.innerHTML += row;
    }

    // Calculate and display averages
    document.getElementById('avg-turnaround').innerText = (totalTurnaround / numJobs).toFixed(2);
    document.getElementById('avg-waiting').innerText = (totalWaiting / numJobs).toFixed(2);

    // Calculate CPU Utilization
    const totalExecutionTime = Math.max(...finishTimes);
    const cpuUtilization = (totalBurstTime / totalExecutionTime) * 100;
    document.getElementById('cpu-utilization').innerText = cpuUtilization.toFixed(2) + '%';
});
