async function fetchGanttData(userId) {
    try {
        const response = await fetch(`/api/user/${userId}/gantt-data`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        const ganttData = [];
        const taskDependencies = {};

        data.forEach(item => {
            
            if (!ganttData.find(task => task.id === `assessment-${item.AssessmentID}`)) {
                ganttData.push({
                    id: `assessment-${item.AssessmentID}`,
                    name: item.AssessmentName,
                    resource: item.ModuleID,
                    startDate: new Date(item.AssessmentDate),
                    endDate: new Date(item.AssessmentDate),
                    percentComplete: 0, 
                    dependencies: null
                });
            }

          
            if (item.TaskID) {
                ganttData.push({
                    id: `task-${item.TaskID}`,
                    name: item.TaskName,
                    resource: item.ModuleID,
                    startDate: new Date(item.TaskDate),
                    endDate: new Date(item.TaskDate), 
                    percentComplete: (item.Status === 'completed') ? 100 : 0, 
                    dependencies: `assessment-${item.AssessmentID}`
                });

               
                if (item.DependencyID) {
                    if (!taskDependencies[item.TaskID]) {
                        taskDependencies[item.TaskID] = [];
                    }
                    taskDependencies[item.TaskID].push(item.DependencyID);
                }
            }
        });


        ganttData.forEach(task => {
            if (task.id.startsWith('task-')) {
                const taskId = parseInt(task.id.split('-')[1], 10);
                if (taskDependencies[taskId]) {
                    task.dependencies = taskDependencies[taskId].map(dep => `task-${dep}`).join(',');
                }
            }
        });

        return ganttData;
    } catch (error) {
        console.error('Error fetching Gantt data:', error);
        return [];
    }
}
