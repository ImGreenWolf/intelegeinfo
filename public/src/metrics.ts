const monitoredValues: Monitor[] = []
interface Monitor {
    value: string, cell: HTMLTableCellElement, container: HTMLDivElement, update: (name, value, isUpdate, cell) => string
}
function UpdateProcessValues(json, index)
{ 
        for(const monitor of monitoredValues)
        {
            let lastObjValue = json
            for(const key of monitor.value.split('.'))
                lastObjValue = lastObjValue[key]

            setInnerHTML(monitor, lastObjValue, true)
            // document.getElementById(monitor.value as string+'-'+index)!.innerHTML = monitor.update(monitor.value,lastObjValue, true, monitor.cell)
        }   
        
     
}

function addMonitor(value: string, index, callback: (name, value, isUpdate, cell) => string)
{
    const name = getName(value as string)
    const cell = document.createElement('td')
    cell.id = value+'-'+index;
    document.getElementById('table-'+index)?.appendChild(cell)
    const container = document.createElement('div')
    cell.appendChild(container)
    const monitor:Monitor = {value, cell, container, update: callback}
    monitoredValues.push(monitor)

    setInnerHTML(monitor, 'Updating..', false)
    new Graph(value, cell, 0,100)
    
    // addMonitorToTable(, cell)
    
}
function setInnerHTML(monitor: Monitor, value: string, isUpdate=true) {

    monitor.container.innerHTML = monitor.update(monitor.value, value, isUpdate, monitor.cell)
}
function getName(value)
{
    const tree = (value as string).split('.')
    return tree.includes('.') ? tree[tree.length-1] : tree[0]
        
}

function addMonitorToTable(table, cell)
{
    document.getElementById(table)?.appendChild(cell)
}




init()
.then(
    () => 
setInterval(
    updateLoop
,300)
)
let globalTime =0;

function init()
{
    return new Promise<void>((resolve, reject) => {
        fetch('metrics/api').then(res => res.json())
        .then(res => {

            let k=0;
            for (const process of res)
            {
                const table = document.createElement('table')
                table.id='table-' + k;
                document.body.appendChild(table)

addMonitor('name', k, (name, value)=> {

    return `<h1>${value}</h1>`
})

addMonitor('monit.cpu', k, (name, value, isUpdate, cell)=> {

        

    Graphs.get(name)?.updateGraph({value, time: globalTime})
    return `<h1>${name}</h1>
    <p>${value}%</p>`
})

addMonitor('pm2_env', k, (name, value)=> {

    return `<h1>${name}</h1>
    <p>${value.status}</p>
    <p>${value.restart_time}</p>`
})




                UpdateProcessValues(process, k)
                k++;
            }

            resolve()
        }).catch(err => reject(err))
    })
    
    

}




function updateLoop()
{
    
        globalTime += 3;
        fetch('metrics/api').then(res => res.json())
        .then(res => {
            let k=0;
            for(const table of res)
                UpdateProcessValues(table, k++)
        }).catch(err => window.alert(err))
        
}
const Graphs: Map<string, Graph> = new Map()

class Graph {
canvas = document.createElement('canvas');
ctx = this.canvas.getContext('2d')!;
time = 0;
minValue;
maxValue;
height = 300;
width = 300;
padding = 20;
maxPoint: {value: 0, time: 0} = {value: 0, time: 0};
secondMaxPoint: {value: 0, time: 0} = {value: 0, time: 0};
points: {value: number, time: number}[] = []
constructor(name: string, parent: HTMLElement, minValue, maxValue) {
    this.minValue = minValue;
    this.maxValue = maxValue;
    this.ctx.moveTo(0,0)
    this.canvas.width =  this.width
    this.canvas.height = this.height
    this.ctx.lineWidth = 5;
    const canvasLayer = document.createElement('div')
    canvasLayer.appendChild(this.canvas)
    canvasLayer.style.position = 'relative';
    parent.appendChild(canvasLayer)
    
    Graphs.set(name, this)
    const pointer = document.createElement('div')
    pointer.innerText = 'dokdkdk'
    pointer.style.cssText = "position: absolute; border-radius: 50%; width: 10px; height: 10px; background-color: black;"
    canvasLayer.appendChild(pointer)
    canvasLayer.onmousemove = ev => {
        // ev.offsetX
        const pointerTime = ev.offsetX
        let distance = 10000
        let closestPoint;
        this.points.forEach(point => {
            if(Math.abs(point.time-this.width - pointerTime) < distance)
            {
                distance = point.time;
                closestPoint = point
            }
                
        });
        if(!closestPoint) return
        const pos = this.calculateXandY(closestPoint)
        pointer.style.top = pos.y + "px"
        pointer.style.left = pos.x + "px"
        console.log(closestPoint)
    }
}


public updateGraph(newPoint: {value, time})
{
    this.time = newPoint.time;


    if(Math.max(0, newPoint.time-this.width) >= this.maxPoint.time)
    {
        this.maxPoint = this.secondMaxPoint
        this.secondMaxPoint = newPoint
    }
        
    
    if(this.secondMaxPoint.value > this.maxPoint.value)
    {
        this.secondMaxPoint = this.maxPoint
        this.maxPoint =  newPoint
    }
        
    this.points.push(newPoint)

    if(this.points[0].time - newPoint.time < this.width * -1)
        this.points.shift()

    //reset canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawBackground()

    //draw points
    this.ctx.lineWidth = 5;
    this.ctx.beginPath();
    for(const point of this.points)
        this.ctx?.lineTo(this.calculateXandY(point).x,this.calculateXandY(point).y)
        // this.ctx?.lineTo(point.time - this.time + this.width - this.padding,
        // this.height-this.normalizeValue(point.value, this.minValue, Math.min(this.maxValue, this.maxPoint.value/1.5))*this.height) //(this.maxValue / this.maxPoint.value)*this.height
    //finish
    this.ctx.stroke();

}
private calculateXandY(point: {value, time})
{
    return {x: point.time - this.time + this.width - this.padding, y: this.height-this.normalizeValue(point.value, this.minValue, Math.max(this.maxValue, this.maxPoint.value))*this.height}
}

private drawBackground() {
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    const segments = 10;
    const segHeight = this.height/segments
    for(let index=0; index<segments;index++)
    {
        this.ctx.moveTo(0,this.height-index*segHeight)
        this.ctx.lineTo(this.width, this.height-index*segHeight)
        this.ctx.fillText(index*segments+":", 10, this.height-index*segHeight)
    }
        this.ctx.stroke();

}

private normalizeValue(value, minValue, maxValue)
{
    return (value-minValue)/(maxValue-minValue)
}

}
