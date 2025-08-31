import { $Enums, Prisma } from "../../../generated/prisma/index.js";
import { createNode } from "../components.js";

async function fetchProblems() {
    try {
        const response = await fetch('/editor/problem/page'); // Adjust the endpoint as needed
        if (!response.ok) {
            throw new Error('Failed to fetch directory data');
        }
        const sessionId = new URLSearchParams(location.search).get('sessionId')
        const data = await response.json() as problems;
        const list = document.getElementById('problem-list');
        list!.innerHTML = '';
        console.log(data)
        data.forEach(item => {
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            const href = `../editor/problem/${sessionId}/details/${item.id}`;
            link.textContent = item.name
            listItem.appendChild(link);
            const progress= item.solves && item.solves.length!=0 ? item.solves[0].score : 0
            list!.appendChild(createNode('a',
                {html: [
                    createNode('div', {
                        htmlSting: 
                        `
                        <div class='display-container'>
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
                                <div class='progress ${progress != 100 ? 'good' : 'bad'}'>
                                    <div style='width: ${progress}%'></div>
                                </div>
                            </div>
                        </div>
                        <div class='info-wrapper'>
                            <h3>Clasa a ${item.grade}-a</h3>
                            <div class='info-container'>
                                <p>${item.description.substring(0,200)}</p>
                                <div>
                                    <div class='button'>
                                        Rezolva
                                    </div>
                                </div>
                            </div>
                        </div>
                        `
                    })
                ],
            attributes: [{name: 'href', value: href}],
            className: `problem-card grade-color-${item.grade}`}
            ));

            
        });
    } catch (error) {
        console.error('Error fetching directory:', error);
    }
}

fetchProblems();

type problems = ({
    tagsLinked: {
        id: number;
        name: string;
    }[];
    solves: {
        id: number;
        sourceCode: string;
        uploadedAt: Date;
        score: number;
        time: number;
        userId: number;
        problemid: number;
    }[];
    _count: {
        tagsLinked: number;
        solves: number;
    };
} & {
    id: number;
    createdAt: Date;
    name: string;
    updatedAt: Date;
    author: string;
    positiveRatings: number;
    negativeRatings: number;
    description: string;
    requirement: Prisma.JsonValue;
    tests: Prisma.JsonValue[];
    averageTimeLimit: number;
    averageMemLimit: number;
    category: string | null;
    sourceCode: string | null;
    difficulty: $Enums.Difficulty | null;
    tags: string[];
    grade: number;
})[]