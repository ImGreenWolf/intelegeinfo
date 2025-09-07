


import { Solve, Assignment, User } from "../../../generated/prisma";
import { createNode } from "../components.js";
import { Class_, dateDeltaToString } from "./mainPage.js";

type Context = {ctx:CanvasRenderingContext2D, w,h,sw, offset,canvas}
let dialog: HTMLDialogElement;
export function loadTeacher(json: Class_) {
    
        
     document.getElementById('flex-header')?.appendChild(createNode('button', {innerText: 'Adauga Tema', async onclick(ev) {
            const dialog = createNode('dialog', {
                className: 'create-assignment',
                htmlSting: `
                <button class='display-close' onclick='this.parentElement.remove()'>x</button>
                <h2>Adauga Tema</h2>
                <form method='post' action='${json.classPath}/a/create'>
                    <input type='text' name='title' placeholder='Titlul temei' required> 
                    <input type='text' name='description' placeholder='Scurta descriere'>
                    <label for='problemId' title='Daca adaugati o problema, veti putea vedea rezultatele de la teste, precum si statistici referiotrii la tema'>
                        <p>Adauga o problema la tema</p>
                        <select id='problem-select' name='problemId' value='null'>
                        </select>
                    </label>
                    <input type="datetime-local" name='deadline' id='deadline'>
                    <button type='submit'>Adauga</button>
                </form>
                `})
                document.body.appendChild(dialog);
                (dialog.querySelector('.display-close') as HTMLButtonElement).onclick = () => {
                    dialog.remove()
                };
                (document.getElementById('deadline') as HTMLInputElement).min = new Date().toISOString()
                console.log( new Date().toISOString())

                dialog.showModal()
            const problems = (await (await fetch('/editor/problem/page')).json())
            document.getElementById('problem-select')!.innerHTML = problems.map(problem => `<option value='${problem.id}'>${problem.name}</option>`).join('\n')
        },
    }))




    
    
    // document.getElementById('info-container')?.appendChild(
    //     createNode('div', {htmlSting: 
    //         `
    //         ${}
    //         `
    //     })
    // )
}
        
export async function displayStudent(id: number, classInfo: Class_) {
    const student = await((await fetch(`${classInfo.classPath}/u/${id}`)).json()) as User & {solves: Solve[]} & {JoinedClass: {userId: number;classId: number;joinDate: Date;}[];}
    console.log(student)
    if(dialog)
        removeDisplayDialouge()
    const problemSolves = new Map<number, Solve[]>();
    for (const m of student.solves) {
        if (!problemSolves.has(m.problemid)) {
            problemSolves.set(m.problemid, []);
        }
        problemSolves.get(m.problemid)!.push(m);
    }

    dialog = createNode('dialog', {
        className: 'user-profile',
        htmlSting: 
        `
        <button class='display-close' onclick='this.parentElement.remove()'>x</button>
        <h2><img src='/user/picture/${student.id}' class='profile'>Profilul lui ${student.username}</h2>
        <h3 style='margin:0'>Acuratete</h3>
        <canvas id='accuracy-display'></canvas>
        <div class='profile-buttons'> <h2>Teme Predate</h2> <span>Dificultati</span> </div>
        <div class='teme'>
        ${
            classInfo.Assignments.length==0 ?
         '<p>Nu ai postat nicio tema inca! Pentru a vedea statistici, v-a trebui sa postezi cel putin o tema, pe care elevul s-o rezolve!</p>' : ''
        }
        ${
            
            classInfo.Assignments.map(assign => {
                const finalSolve = student.solves.sort((a,b) => b.score -a.score).find(solve => solve.problemid == assign.problemId);
                if(!assign.problemId)
                    return ''
                const solutions = problemSolves.get(assign.problemId)!
                let classList = '';
                if(new Date(student.JoinedClass[0].joinDate).valueOf() > new Date(assign.createdAt).valueOf())
                    classList += ' old';
                if(!finalSolve || !solutions)
                    return `<div class='${classList}'><h3>${assign.title}</h3><span>Tema nu a fost predata...</span></div>`

                if(finalSolve.score!=100)
                    classList += ' unfinished'
                const averageScore = (solutions.reduce((acc, val) => acc += val.score, 0)/solutions.length)



                return `<div class='${classList}'>
                    
                    <h3>${assign.title}</h3>
                    <a href='/editor?content=${encodeURIComponent(student.username+'.cpp:'+finalSolve.sourceCode)}'>
                        Solutie: <span ${finalSolve.score == 100 ? 'class="good"': ''}>${finalSolve.score!.toFixed()}</span> pt.
                    </a>
                    <div>Punctaj Mediu: <span ${averageScore == 100 ? 'class="good"': ''}>
                    ${averageScore.toFixed(1)} in ${solutions.length!.toFixed(0)} incercari</span></div>
                    <div>${dateDeltaToString(new Date(finalSolve.uploadedAt), true)}</div> 
                    

                
                </div>`
            }).join('\n')
        }</div>
        ` })
        document.body.appendChild(dialog);
        if(classInfo.Assignments.length!=0)
         'Nu ai postat nicio tema inca! Pentru a vedea statistici, v-a trebui sa postezi cel putin o tema, pe care elevul s-o rezolve!';

        renderAccuracy('accuracy-display', student.solves, classInfo, classInfo.Assignments, problemSolves);

    (dialog.querySelector('.display-close') as HTMLButtonElement).onclick = () => {
        removeDisplayDialouge()
    }
        
        dialog.show()
                
}


function flushValues() {
    sortedSolves = undefined
}


function removeDisplayDialouge() {
    flushValues()
    dialog.remove()
}


let sortedSolves: Solve[] | undefined;
function cacheValues(solves: Solve[], classInfo: Class_) {
    if(!sortedSolves)
        sortedSolves = solves
    .sort((a,b) => new Date(a.uploadedAt).valueOf() - new Date(b.uploadedAt).valueOf())
}


// save viewer values between users
let offset = 0;
let scaleInDays = 7;

function renderAccuracy(id, solves: Solve[], classInfo, assignments, problemSolves) {
    const canvas = document.getElementById(id) as HTMLCanvasElement

    canvas.onmouseup  = canvas.onmouseleave = () => canvas.onmousemove = null;
    canvas.onwheel = (ev) => {
        
        if(!ev.ctrlKey)
             offset += ev.deltaY/5
        else
        {
            const delta = ev.deltaY/2000
            // Calculate the time (in days) at the center before scaling
            const centerTime = offset / w * scaleInDays + scaleInDays / 2;
            // Update scaleInDays
            scaleInDays = Math.min(100, Math.max(1, scaleInDays + delta * scaleInDays));
            // Adjust offset so that the center stays at the same logical time
            offset = (centerTime - scaleInDays / 2) * w / scaleInDays;
        }
       
        update()
        ev.preventDefault()

    }
    canvas.onmousedown = () => 
        canvas.onmousemove = ev =>  {
            offset += ev.movementX
            update()
    }
    new ResizeObserver(() => {
        canvas.width = canvas.clientWidth
        canvas.height = canvas.clientHeight
        w = canvas.width
        h = canvas.height
        update()
    }).observe(canvas) 


    function update() {
        drawSolutions({ctx, h,w,sw,offset, canvas}, assignments,problemSolves, solves, scaleInDays)
    }
    
    const ctx = canvas.getContext('2d')!
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight
    let w = canvas.width
    let h = canvas.height

    cacheValues(solves, classInfo)

    const sw = 2.5
    update()

}

function drawBackground(context:Context, scaleInDays) {
    const ctx = context.ctx
    const w = context.w
    const h = context.h
    const offset = +context.offset
    const startDate =  new Date(Date.now() - 1000*60*60*24*scaleInDays) //4 days
    const nowDate = new Date()
    ctx.beginPath()
     const baseColor = 100;
     const baseColorString = '#'+Math.max(0, Math.trunc(baseColor)).toString(16).repeat(3);
    // const color = '#'+Math.max(0, Math.trunc((100*(1-scaleInDays/14)))).toString(16).repeat(3);
    ctx.strokeStyle = baseColorString
    const stepDaySize = (scaleInDays>14 ? (scaleInDays>31 ? 31 : 7) : 1)
    const stepName = 'zi'
    const scale = w/scaleInDays * stepDaySize
    
    const indexOffset = +Math.trunc(offset/scale)+1
    const padding = 1
    ctx.lineWidth = 0.5
    for(let index=-padding; index<w/scale+padding;index++)
    {
        ctx.setLineDash([6,3])
        const lw =w-(index+indexOffset)*scale+offset
        ctx.moveTo(lw,0)
        ctx.lineTo(lw,h)
        ctx.stroke()
        
        ctx.setLineDash([])
        ctx.strokeText(`${(index+indexOffset)*stepDaySize} ${stepName}`, lw+3, 10)
    }
    ctx.lineWidth = 0.25
    ctx.setLineDash([200/scaleInDays,200/scaleInDays/2])
    ctx.moveTo(0,h/2)
    ctx.lineTo(w,h/2)
    ctx.stroke()
    ctx.setLineDash([])
}

function drawSolutions(context:Context ,assignments: Assignment[], problemSolves: Map<number, Solve[]>, solves: Solve[], scaleInDays=4) {
    let index=1;
    // let sum=0;
    let last;
    context.ctx.clearRect(0,0,context.w,context.h)

    drawBackground(context, scaleInDays)

    context.ctx.beginPath()
    context.ctx.lineWidth = context.sw

    const gradient = context.ctx.createLinearGradient(0,0,0,context.h)
    gradient.addColorStop(0.5, 'rgba(0, 255, 0, 0.55)')
    gradient.addColorStop(1,'rgba(0, 138, 0, 0.05)')
    context.ctx.fillStyle = gradient


    context.ctx.strokeStyle = 'rgba(0, 45, 0, 0.1)'
    function transformPos(x,y) {
        return {x, y: context.h-y}
    }
    const posisitons: {pos: {x,y}, solve: Solve, score: number}[] = []
    const startDate =  new Date(Date.now() - 1000*60*60*24*scaleInDays).valueOf() //4 days
    if(assignments.length == 0)
        return {err: 'Nu ai postat nicio tema inca! Pentru a vedea statistici, v-a trebui sa postezi cel putin o tema, pe care elevul s-o rezolve!'}
    for(const assign of assignments) 
    {
        let sum=0;
        if(assign.problemId && problemSolves.has(assign.problemId))
        for(const solve of problemSolves.get(assign.problemId)!) {
            // for each assignment, get the solutions
            const solveDate = new Date(solve.uploadedAt).valueOf()
            const lw = (solveDate - startDate)/(Date.now() - startDate) * context.w + context.offset
            sum += (solve.score)
            const pos = transformPos(lw, sum/index++)
            
            posisitons.push({pos, solve, score: sum})
        }
    }
       
    const sortedPositions = posisitons.sort((a,b) => new Date(b.solve.uploadedAt).valueOf() - new Date(a.solve.uploadedAt).valueOf())
     index=1;
    for(const point of sortedPositions) 
        drawLine(point)

    
    function drawLine(point: typeof sortedPositions[number]) {
        const lw = point.pos.x
        const lh = point.pos.y 
                
        if(!last)
            {
                last = {lw: point.pos.x, lh: point.pos.y}
                context.ctx.lineTo(lw, lh)
                return;
            }
            context.ctx.lineTo(lw, lh)
            last = {lw: point.pos.x, lh: point.pos.y}
            index++;
    }
    if(sortedPositions.at(-1) != undefined)
        context.ctx.lineTo(sortedPositions.at(-1)?.pos.x, context.h)
    if(sortedPositions.at(0) != undefined)
        context.ctx.lineTo(Math.max(0, sortedPositions.at(0)?.pos.x), context.h)
    context.ctx.closePath()
    context.ctx.fillStyle = gradient
    context.ctx.stroke()
    context.ctx.fill()
}


export function clamp(input: number, min: number, max: number): number {
  return input < min ? min : input > max ? max : input;
}

export function map(current: number, in_min: number, in_max: number, out_min: number, out_max: number): number {
  const mapped: number = ((current - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
  return clamp(mapped, out_min, out_max);
}