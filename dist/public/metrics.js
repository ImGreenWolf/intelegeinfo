"use strict";
const monitoredValues = [];
function UpdateProcessValues(json, index) {
    for (const monitor of monitoredValues) {
        let lastObjValue = json;
        for (const key of monitor.value.split('.'))
            lastObjValue = lastObjValue[key];
        setInnerHTML(monitor, lastObjValue, true);
        // document.getElementById(monitor.value as string+'-'+index)!.innerHTML = monitor.update(monitor.value,lastObjValue, true, monitor.cell)
    }
}
function addMonitor(value, index, callback) {
    const name = getName(value);
    const cell = document.createElement('td');
    cell.id = value + '-' + index;
    document.getElementById('table-' + index)?.appendChild(cell);
    const container = document.createElement('div');
    cell.appendChild(container);
    const monitor = { value, cell, container, update: callback };
    monitoredValues.push(monitor);
    setInnerHTML(monitor, 'Updating..', false);
    // addMonitorToTable(, cell)
}
function setInnerHTML(monitor, value, isUpdate = true) {
    monitor.container.innerHTML = monitor.update(monitor.value, value, isUpdate, monitor.cell);
}
function getName(value) {
    const tree = value.split('.');
    return tree.includes('.') ? tree[tree.length - 1] : tree[0];
}
function addMonitorToTable(table, cell) {
    document.getElementById(table)?.appendChild(cell);
}
init()
    .then(() => setInterval(updateLoop, 300));
let globalTime = 0;
function init() {
    return new Promise((resolve, reject) => {
        fetch('metrics/api').then(res => res.json())
            .then(res => {
            let k = 0;
            for (const process of res) {
                const table = document.createElement('table');
                table.id = 'table-' + k;
                document.body.appendChild(table);
                addMonitor('name', k, (name, value) => {
                    return `<h1>${value}</h1>`;
                });
                addMonitor('monit.cpu', k, (name, value, isUpdate, cell) => {
                    if (isUpdate)
                        Graphs.get(name)?.updateGraph({ value, time: globalTime });
                    else
                        new Graph(name, cell, 0, 100);
                    return `<h1>${name}</h1>
                    <p>${value}%</p>`;
                });
                addMonitor('monit.memory', k, (name, value, isUpdate, cell) => {
                    if (isUpdate)
                        Graphs.get(name)?.updateGraph({ value, time: globalTime });
                    else
                        new Graph(name, cell, 10000000, 800000000);
                    return `<h1>${name}</h1>
                    <p>${value}%</p>`;
                });
                addMonitor('pm2_env', k, (name, value, isUpdate) => {
                    return `<h1>${name}</h1>
                    <p>${value.status}</p>
                    <p>${value.restart_time}</p>`;
                });
                UpdateProcessValues(process, k);
                k++;
            }
            let ws = new WebSocket('ws://intelegeinfo.go.ro/api');
            const start = Date.now();
            ws.onmessage = (ev) => {
                const res = JSON.parse(ev.data);
                globalTime = (Date.now() - start) / 100;
                let k = 0;
                for (const table of res)
                    UpdateProcessValues(table, k++);
            };
            resolve();
        }).catch(err => reject(err));
    });
}
function updateLoop() {
    // globalTime += 3;
    for (const graph of Graphs.values())
        graph.redrawGraph();
    // fetch('metrics/api').then(res => res.json())
    // .then(res => {
    //     let k=0;
    //     for(const table of res)
    //         UpdateProcessValues(table, k++)
    // }).catch(err => window.alert(err))
}
const Graphs = new Map();
class Graph {
    canvas = document.createElement('canvas');
    ctx = this.canvas.getContext('2d');
    time = 0;
    minValue;
    maxValue;
    height = 300;
    width = 300;
    padding = 20;
    maxPoint = { value: 0, time: 0 };
    secondMaxPoint = { value: 0, time: 0 };
    points = [];
    closestPoint = this.maxPoint;
    pointer;
    zoom = { time: 1, value: 2 };
    constructor(name, parent, minValue, maxValue) {
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.ctx.moveTo(0, 0);
        this.canvas.width = this.width + this.padding;
        this.canvas.height = this.height + this.padding;
        this.ctx.lineWidth = 5;
        const canvasLayer = document.createElement('div');
        canvasLayer.appendChild(this.canvas);
        this.createZoomButtons(canvasLayer);
        canvasLayer.style.position = 'relative';
        parent.appendChild(canvasLayer);
        let pointerTimeout;
        Graphs.set(name, this);
        this.pointer = document.createElement('div');
        this.pointer.innerText = '...';
        this.pointer.style.cssText = "position: absolute; border-radius: 50%; width: 15px; height: 15px; background-color: white; font-size: 12px";
        canvasLayer.appendChild(this.pointer);
        canvasLayer.onmousemove = ev => {
            // ev.offsetX
            const curosrPoint = { time: ev.offsetX, value: ev.offsetY };
            let distance = 10000;
            this.points.forEach(point => {
                const coords = this.calculateXandY(point);
                const dist = Math.sqrt(Math.pow(coords.x - curosrPoint.time, 2) + Math.pow(coords.y - curosrPoint.value, 2));
                if (dist < distance) {
                    distance = dist;
                    this.closestPoint = point;
                }
            });
            if (!this.closestPoint)
                return;
            clearTimeout(pointerTimeout);
            this.pointer.style.opacity = 100 + "%";
            this.updatePointer();
            pointerTimeout = setTimeout(() => {
                this.pointer.style.opacity = 0 + "%";
            }, 3000);
            // const pos = this.calculateXandY(this.closestPoint)
            // this.pointer.style.top = pos.y + "px"
            // this.pointer.style.left = pos.x + "px"
        };
    }
    createZoomButtons(canvasLayer) {
        const up = document.createElement('button');
        up.innerText = "+";
        up.onclick = () => { this.zoom = { time: this.zoom.time, value: Math.min(30, this.zoom.value + 0.5) }; this.redrawGraph(); };
        const down = document.createElement('button');
        down.innerText = "-";
        down.onclick = () => { this.zoom = { time: this.zoom.time, value: Math.max(0.1, this.zoom.value - 0.5) }; this.redrawGraph(); };
        canvasLayer.appendChild(up);
        canvasLayer.appendChild(down);
    }
    updatePointer() {
        const pos = this.calculateXandY(this.closestPoint);
        this.pointer.style.top = pos.y + "px";
        this.pointer.style.left = pos.x + "px";
        this.pointer.innerText = this.closestPoint.value + '%';
    }
    updateGraph(newPoint) {
        this.time = newPoint.time;
        if (Math.max(0, newPoint.time - this.width) >= this.maxPoint.time) {
            this.maxPoint = this.secondMaxPoint;
            this.secondMaxPoint = newPoint;
        }
        if (this.secondMaxPoint.value > this.maxPoint.value) {
            this.secondMaxPoint = this.maxPoint;
            this.maxPoint = newPoint;
        }
        this.points.push(newPoint);
        if (this.points[0].time - newPoint.time < this.width * -1)
            this.points.shift();
        // this.redrawGraph()
    }
    redrawGraph() {
        //reset canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBackground();
        //draw points
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        for (const point of this.points)
            if (this.calculateXandY(point).x > this.padding)
                this.ctx?.lineTo(this.calculateXandY(point).x, this.calculateXandY(point).y);
        // this.ctx?.lineTo(point.time - this.time + this.width - this.padding,
        // this.height-this.normalizeValue(point.value, this.minValue, Math.min(this.maxValue, this.maxPoint.value/1.5))*this.height) //(this.maxValue / this.maxPoint.value)*this.height
        //finish
        this.updatePointer();
        this.ctx.stroke();
    }
    calculateXandY(point) {
        return { x: (point.time - this.time) * this.zoom.time + this.width - this.padding,
            y: this.height + this.padding - this.normalizeValue(point.value, this.minValue, Math.max(this.maxValue, this.maxPoint.value)) * this.height * this.zoom.value };
    }
    drawBackground() {
        const segments = 10;
        const segHeight = this.height / segments / this.zoom.value;
        for (let index = 0; index <= segments; index++) {
            this.ctx.beginPath();
            if (index % 5 == 0)
                this.ctx.lineWidth = 2;
            else
                this.ctx.lineWidth = 1;
            let start = this.calculateXandY({ time: this.padding, value: index * segHeight });
            // start = {x: start.x, y: start.y - this.padding};
            if (start.y < 0)
                break;
            this.ctx.moveTo(this.padding, start.y);
            this.ctx.lineTo(this.width - this.padding, start.y);
            // this.ctx.moveTo(this.padding,this.height-index*segHeight+1)
            // this.ctx.lineTo(this.width-this.padding, this.height-index*segHeight)
            this.ctx.fillText(index * segHeight + ":", 0, start.y);
            this.ctx.stroke();
        }
    }
    normalizeValue(value, minValue, maxValue) {
        return (value - minValue) / (maxValue - minValue);
    }
}
