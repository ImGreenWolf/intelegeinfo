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
    parent.appendChild(this.canvas)
    Graphs.set(name, this)
    
    
}


public updateGraph(newPoint: {value, time})
{
    if(newPoint.time-this.width > this.maxPoint.time)
        this.maxPoint = this.secondMaxPoint
    
    if(this.secondMaxPoint.value > this.maxPoint.value)
    {
        this.secondMaxPoint = this.maxPoint
        this.maxPoint =  newPoint
    }
        


    this.points.push(newPoint)
    if(this.points[0].time - newPoint.time < this.width * -1)
        this.points.shift()

    console.log(this.points.length)
        // if(this.points.length > (newPoint.time-this.time)*this.width)
        //     this.points.shift()
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawBackground()
    //draw points
    this.ctx.beginPath();
    for(const point of this.points)
    {
        // if(point.time - this.time > this.width + 50)
        //     this.points.splice(this.points.indexOf(point))

        this.ctx?.lineTo(point.time - newPoint.time + this.width,
        this.height-this.normalizeValue(point.value, this.minValue, this.maxValue)*this.height) //(this.maxValue / this.maxPoint.value)*this.height

    }
    this.ctx.stroke();

    this.time = newPoint.time;
}

private drawBackground() {
    this.ctx.beginPath();
    const segments = 10;
    const segHeight = this.height/segments
    for(let index=0; index<segments;index++)
    {
        this.ctx.moveTo(0,this.height-index*segHeight)
        this.ctx.lineTo(this.width, this.height-index*segHeight)
        this.ctx.fillText(index+":", this.width - 50, this.height-index*segHeight)
    }
        this.ctx.stroke();

}

private normalizeValue(value, minValue, maxValue)
{
    return (value-minValue)/(maxValue-minValue)
}

}
