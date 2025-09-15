import { createNode } from "../components.js";
async function fetchProblems() {
    try {
        const response = await fetch('/editor/problem/page'); // Adjust the endpoint as needed
        if (!response.ok) {
            throw new Error('Failed to fetch directory data');
        }
        const sessionId = new URLSearchParams(location.search).get('sessionId');
        const clientId = new URLSearchParams(location.search).get('clientId');
        const data = await response.json();
        const list = document.getElementById('problem-list');
        list.innerHTML = '';
        console.log(data);
        data.forEach(item => {
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            const href = `../editor/problem/${sessionId}/details/${item.id}?clientId=${clientId}`;
            link.textContent = item.name;
            listItem.appendChild(link);
            const progress = item.solves && item.solves.length != 0 ? item.solves[0].score : 0;
            list.appendChild(createNode('div', { htmlSting: `
                <a class='display-container' href='${href}'>
                    <div class='upper'>
                        <div>
                            <h3>${item.category}</h3>
                            ${item._count && item._count.solves >= 100 ? `<h3>${item._count.solves}</h3>` : ''}
                        </div>
                        <h2>${item.name}</h2>
                        
                    </div>
                    <div class='lower'>
                        <div class='tag-container'>
                            ${item.tags.map(tag => `<span>${tag}</span>`).join('\n')}
                        </div>
                        <h2 class='${progress > 25 ? 'good' : 'bad'}'>${progress}%</h2>
                        <div class='progress ${progress == 100 ? 'good' : 'bad'}'>
                            <div style='width: ${progress}%'></div>
                        </div>
                    </div>
                </a>
                <div class='info-wrapper'>
                    <h3>Clasa a ${item.grade}-a</h3>
                    <div class='info-container'>
                        <p>${item.description.substring(0, 200)}</p>
                        <div>
                            <a class='button' href='${href}'>
                                Rezolva
                            </a>
                        </div>
                    </div>
                </div>
                `,
                // attributes: [{name: 'href', value: href}],
                className: `problem-card grade-color-${item.grade}` }));
        });
        for (const problem of document.getElementsByClassName('problem-card'))
            problem.style.height = problem.clientHeight + "px", problem.style.maxHeight = problem.clientHeight + "px";
    }
    catch (error) {
        console.error('Error fetching directory:', error);
    }
}
fetchProblems();
