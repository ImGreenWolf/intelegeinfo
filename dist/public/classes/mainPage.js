import { createNode } from "../components.js";
import * as teacherScript from './teacher.js';
const sqids = new Sqids({
    minLength: 6,
    alphabet: 'abcdefghijklmnopqrstuvwxyz'
});
const searchParams = new URLSearchParams(location.search);
main();
let selectedClass;
let userClasses;
let userActive;
async function main() {
    userClasses = await updateClassList();
    let classIndex = 0;
    if (searchParams.has('class') && searchParams.get('class').length >= 6)
        classIndex = userClasses.classes.findIndex(class_ => class_.id == sqids.decode(searchParams.get('class'))[0]);
    selectedClass = userClasses.classes[classIndex == -1 ? 0 : classIndex];
    if (selectedClass)
        load(selectedClass);
}
async function updateClassList(classes) {
    const json = classes ?? await (await fetch('/classes/u')).json();
    document.getElementById('list').replaceChildren(...json.classes.map((val, index) => {
        let classList = '';
        if (selectedClass && val.id == selectedClass.id)
            classList += ' selected';
        if (val.creatorId == json.user.id)
            classList += ' owner';
        return createNode('button', {
            htmlSting: `${val.name}`,
            onclick(ev) {
                load(val);
            },
            css: `--bgColor: #${val.color}`,
            className: classList ?? ''
        });
    }));
    return json;
}
function calcTextColor(bgColor) {
    let sum = 0;
    for (let i = 0; i < bgColor.length - 2; i++)
        sum += parseInt(bgColor.substring(i, i + 2), 8);
    if (sum / 3 < 255 / 2)
        return 'ffffff';
    else
        return '000000';
}
let cache = new Map();
let json;
async function load(loadClass) {
    const classPath = `/classes/c/${loadClass.id}/${loadClass.name.replaceAll(' ', '-')}`;
    if (json && json.id == loadClass.id)
        return;
    //caching
    if (!cache.has(loadClass.id)) {
        const loadedClass = await ((await fetch(`/classes/c/${loadClass.id}/${loadClass.name.replaceAll(' ', '-')}`)).json());
        loadedClass.classPath = classPath;
        cache.set(loadClass.id, loadedClass);
    }
    json = cache.get(loadClass.id);
    const encodedString = sqids.encode([json.id.toString()]);
    searchParams.set('class', encodedString);
    history.pushState({ class: encodedString }, json.name, location.pathname + "?" + searchParams.toString());
    selectedClass = loadClass;
    updateClassList(userClasses);
    const classElem = document.getElementById('class-details');
    classElem.style = `--classColor: #${json.color}; --textColor: #${calcTextColor(json.color)};`;
    classElem.innerHTML =
        `
    <div class='header-container'>
        <h2>${json.name}</h2>
        <div id='flex-header'>
            <span>${json._count.Assignments} teme</span>
        </div>
    </div>
    <div id='info-container'>
    ${json.description && !json.isOwner ? `
        <div>
        <h3>Descriere</h3>
        <p>
        ${json.description}
        </p>
        </div>
        ` : ''}
        
    </div>
     <div class='assigments' id='assignments'>
        </div>
    <div id='class-container'>
        
      
       
        
    </div>
    <div class='people-container' id='people'>
        
    </div>
    `;
    let persClickFunction = (id, classInfo) => { };
    if (json.isOwner) {
        teacherScript.loadTeacher(json);
        persClickFunction = teacherScript.displayStudent;
    }
    const studentNodes = new Map();
    document.getElementById('people')?.replaceChildren(...[
        createNode('div', {
            onclick: () => persClickFunction(json.Creator.id, json),
            htmlSting: `<img src='/user/upload/${json.Creator.picture}' class='profile'><div><h4>${json.Creator.username}</h4><p>Profesor</p></div></div>`
        }),
        createNode('span', {
            htmlSting: `<h3>ELEVI</h3><p>${json._count.Students}</p>`
        }),
        json.Students.length == 0 ? createNode('p', { htmlSting: "Invita elevii sa intre in clasa ta apasand pe butonul share!" }) : '',
        ...json.Students.map(student => student.User)
            .map(student => {
            const node = createNode('div', {
                onclick: () => persClickFunction(student.id, json),
                css: `--userColor: #` + student.userColor,
                className: 'student',
                htmlSting: `<imgw><img src='/user/picture/${student.id}' class='profile'></imgw><h4>${student.username}</h4></div>`
            });
            studentNodes.set(student.id, node);
            return node;
        })
    ]);
    const id = json.id ? sqids.encode([json.id]) : ''; // "86Rf07xd4z"
    document.getElementById('flex-header')?.append(...[createNode('button', { innerText: 'Share', async onclick(ev) {
                navigator.clipboard.writeText(location.toString() + `join?class=${loadClass.id}:${loadClass.name}`);
            }, }),
        createNode('p', { innerText: id })
    ]);
    if (json.Assignments.length != 0)
        document.getElementById('assignments')?.replaceChildren(...json.myAssignments.map(assignment => {
            const pastDueDate = assignment.dueDate ? Date.now() > new Date(assignment.dueDate).valueOf() : false;
            const solves = json.mySolves;
            const finalSolve = solves.sort((a, b) => b.score - a.score)[0];
            console.log(finalSolve);
            const wrapper = createNode('div', {
                className: 'assignment-wrapper' + (pastDueDate ? ' past-due-date' : '') + (finalSolve.score == 100 ? ' done' : ''),
                html: [createNode('div', {
                        className: 'asignment-content',
                        onclick(ev) {
                            loadAssignment(assignment.id, wrapper);
                        },
                        htmlSting: `
                    <div class='title-container'>
                        <h3>${assignment.title}</h3>
                        ${assignment.Problem ? `<a href='/editor?problem=${assignment.Problem.id}'>${assignment.Problem.name}</a>` : ''}
                    </div>
                    <div>
                        ${assignment.description ? '<h6>Descriere</h6>' : ''}
                    <p class='description'>${assignment.description}</p>
                    </div>
                    ${assignment.Problem ? `
                    <div class='assignment-progress'>
                            <div style='width: ${json.Students.reduce((acc, student) => acc += student.User.solves.find(solve => solve.problemid == assignment.problemId && solve.score == 100) != undefined ? 1 : 0, 0) / json._count.Students * 100}%'></div>
                    </div>
                    ` : ''}
                    <div class='date-container'>
                        <p>${dateDeltaToString(new Date(assignment.createdAt), true)}</p>
                        ${assignment.dueDate ? `<p class='deadline'>Deadline: ${new Date(assignment.dueDate).toLocaleString('ro-RO')}</p>` : ''}
                    </div>
                    <div class='assignment-completed'></div>
                    `
                    })
                ]
            });
            return wrapper;
        }));
    else if (json.isOwner)
        document.getElementById('assignments').innerHTML = '<p>Adauga o tema!</p>';
    else
        document.getElementById('assignments').innerHTML = '<p>Momentan nu ai teme de predat.</p>';
    if (userActive && userActive.OPEN)
        userActive.close();
    userActive = new WebSocket('/classes?id=' + json.id);
    userActive.onmessage = (ev) => {
        const body = JSON.parse(ev.data);
        for (const user of body.activeUsers) {
            if (user.active)
                studentNodes.get(user.id)?.classList.add('active');
            else
                studentNodes.get(user.id)?.classList.remove('active');
        }
    };
    async function loadAssignment(id, elem) {
        const assign = await ((await fetch(`${classPath}/a/${id}/l`)).json());
        const users = new Map();
        for (const solve of assign.assign.Problem.solves)
            if (users.has(solve.userId))
                users.get(solve.userId).push(solve);
            else
                users.set(solve.userId, [solve]);
        if (elem.querySelector(' .solves-container'))
            return elem.querySelector(' .solves-container')?.remove();
        const container = elem.appendChild(createNode('div', { className: 'solves-container', htmlSting: `<span>${assign.assign.description} ${json.Students.reduce((acc, student) => acc += student.User.solves.find(solve => solve.problemid == assign.assign.problemId && solve.score == 100) != undefined ? 1 : 0, 0)} / ${json._count.Students} elevi au trimis tema</span>` }));
        for (const [userid, solves] of users) {
            const user = solves[0].user;
            const finalSolve = solves.sort((a, b) => b.score - a.score)[0];
            const isOld = new Date(finalSolve.uploadedAt).valueOf() < new Date(assign.assign.createdAt).valueOf();
            container.appendChild(createNode('div', { htmlSting: `<div class='profile-container'><img src='/user/picture/${user.id}' class='profile'>${user.username}</div>
                <div>Medie scor: ${(solves.map(solve => solve.score).reduce((acc, val) => acc + val) / solves.length).toFixed(1)} in ${solves.length} incercari</div>
                <a href='/editor?content=${encodeURIComponent(user.username + '.cpp:' + finalSolve.sourceCode)}'>Scor: ${finalSolve.score.toFixed(1)} ${dateDeltaToString(new Date(finalSolve.uploadedAt), true)}</a>
                `,
                className: isOld ? 'old' : ''
            }));
        }
    }
}
const TimeUnit = {
    years: {
        'ro-RO': 'ani',
        'en-US': 'years'
    },
    months: {
        'ro-RO': 'luni',
        'en-US': 'months'
    },
    days: {
        'ro-RO': 'zile',
        'en-US': 'days'
    },
    hours: {
        'ro-RO': 'ore',
        'en-US': 'hours'
    },
    minutes: {
        'ro-RO': 'minute',
        'en-US': 'minutes'
    },
    seconds: {
        'ro-RO': 'secunde',
        'en-US': 'seconds'
    },
};
export function dateDeltaToString(date, capitalize = true, language = 'ro-RO') {
    function formatTime(time, unit) {
        switch (language) {
            case 'ro-RO':
                return `${capitalize ? "A" : 'a'}cum ${time} ${TimeUnit[unit][language]}`;
            case 'en-US':
                return `${time} ${TimeUnit[unit][language]} ago`;
        }
    }
    const now = new Date();
    // Calculate the difference in seconds
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffMonth = (now.getUTCFullYear() - date.getUTCFullYear()) * 12 + (now.getUTCMonth() - date.getUTCMonth());
    const diffYear = now.getUTCFullYear() - date.getUTCFullYear();
    if (diffYear >= 1)
        return formatTime(diffYear, 'years');
    else if (diffMonth >= 1)
        return formatTime(diffMonth, 'months');
    else if (diffDay >= 1)
        return formatTime(diffDay, 'days');
    else if (diffHour >= 1)
        return formatTime(diffHour, 'hours');
    else if (diffMin >= 1)
        return formatTime(diffMin, 'minutes');
    else
        return formatTime(diffSec, 'seconds');
}
