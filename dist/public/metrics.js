"use strict";
const monitoredValues = [];
function UpdateProcessValues(json, rawJSON) {
    for (const monitor of monitoredValues) {
        if (monitor.value.split('.')[0] == 'pm2')
            updateMonitor(monitor, json);
    }
}
function updateMonitor(monitor, json) {
    let lastObjValue = json;
    for (const key of monitor.value.split('.'))
        if (key == 'pm2')
            continue;
        else
            lastObjValue = lastObjValue[key];
    setInnerHTML(monitor, lastObjValue, true);
}
function addMonitor(value, displayName, index, callback) {
    const name = getName(value);
    const cell = document.createElement('td');
    cell.id = value + '-' + index;
    document.getElementById('table-' + index)?.appendChild(cell);
    const container = document.createElement('div');
    cell.appendChild(container);
    const monitor = { value, cell, displayName, container, update: callback };
    monitoredValues.push(monitor);
    setInnerHTML(monitor, 'Updating..', false);
}
function setInnerHTML(monitor, value, isUpdate = true) {
    try {
        monitor.container.innerHTML = monitor.update(monitor.displayName, value, isUpdate, monitor.cell);
    }
    catch (err) {
        console.error(err);
    }
}
function getName(value) {
    const tree = value.split('.');
    return tree.includes('.') ? tree[tree.length - 1] : tree[0];
}
function addMonitorToTable(table, cell) {
    document.getElementById(table)?.appendChild(cell);
}
init()
    .then(() => setInterval(updateLoop, 100));
let globalTime = 0;
function init() {
    return new Promise((resolve, reject) => {
        fetch('metrics/api').then(res => res.json())
            .then(res => {
            let k = 0;
            for (const process of res.pm2) {
                const table = document.createElement('div');
                table.classList = 'grid';
                table.id = 'table-' + k;
                document.getElementById('processes-container').appendChild(table);
                addMonitor('pm2.name', "Info", k, (name, value) => {
                    return `<h1>${value}</h1>`;
                });
                addMonitor('pm2.monit.cpu', "CPU Usage", k, (name, value, isUpdate, cell) => {
                    if (isUpdate) {
                        const graph = Graphs.get(name);
                        graph.updateGraph({ value, time: globalTime });
                    }
                    else {
                        const graph = new Graph(name, cell, 0, 100);
                        graph.addLine((graph) => {
                            let median = 0;
                            graph.points.forEach(point => median += point.value);
                            return { value: median / graph.points.length, color: 'yellow', width: 1 };
                        });
                    }
                    return `<h1>${name}</h1>
                    <p>${value}%</p>`;
                });
                addMonitor('pm2.monit.memory', "Memory Usage", k, (name, value, isUpdate, cell) => {
                    if (isUpdate)
                        Graphs.get(name)?.updateGraph({ value: value / 1000000, time: globalTime });
                    else {
                        new Graph(name, cell, 50, 500);
                        return '';
                    }
                    return `<h1>${name}</h1>
                    <p>${value}%</p>`;
                });
                addMonitor('pm2.pm2_env', "Status", k, (name, value, isUpdate) => {
                    return `<h1>${name}</h1>
                    <p>${value.status}</p>
                    <p>${value.restart_time}</p>
                    <p>${value.axm_monitor["Active requests"].value}</p>
                    <p>${value.axm_monitor.HTTP.value} <span>${value.axm_monitor.HTTP.unit}</span></p>`;
                });
                UpdateProcessValues(process, k);
                k++;
            }
            addMonitor('os.cpu.0.speed', "CPU Frequency", 0, (name, value, isUpdate, cell) => {
                if (isUpdate) {
                    const graph = Graphs.get(name);
                    graph.updateGraph({ value, time: globalTime });
                }
                else {
                    const graph = new Graph(name, cell, 400, 3600);
                    graph.addLine((graph) => {
                        let median = 0;
                        graph.points.forEach(point => median += point.value);
                        return { value: median / graph.points.length, color: 'yellow', width: 1 };
                    });
                }
                return `<h1>${name}</h1>
                    <p>${value}%</p>`;
            });
            let ws = new WebSocket('ws://intelegeinfo.go.ro/api');
            const start = Date.now();
            ws.onmessage = (ev) => {
                const res = JSON.parse(ev.data);
                if (res.output) {
                    const output = document.getElementById('output');
                    output.innerHTML += res.output;
                    output.scrollTop = output.scrollHeight;
                }
                else {
                    globalTime = (Date.now() - start) / 100;
                    let k = 0;
                    for (const table of res.pm2)
                        UpdateProcessValues(table, k++);
                    for (const monitor of monitoredValues)
                        if (monitor.value.split('.')[0] != 'pm2')
                            updateMonitor(monitor, res);
                }
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
    zoom = { time: 1, value: 1 };
    lines = [];
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
        this.lines.forEach(line => {
            this.drawLineAtValue(line);
        });
        //draw points
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = 'black';
        this.ctx.beginPath();
        for (const point of this.points)
            if (this.calculateXandY(point).x > this.padding)
                this.ctx?.lineTo(this.calculateXandY(point).x, this.calculateXandY(point).y);
        //finish
        this.updatePointer();
        this.ctx.stroke();
    }
    calculateXandY(point, normalize = true) {
        if (normalize)
            return { x: (point.time - this.time) * this.zoom.time + this.width - this.padding,
                y: this.height + this.padding - this.normalizeValue(point.value, this.minValue, Math.max(this.maxValue, this.maxPoint.value)) * this.height * this.zoom.value };
        else
            return { x: (point.time - this.time) * this.zoom.time + this.width - this.padding,
                y: this.height + this.padding - this.normalizeValue(point.value, 0, this.height) * this.height * this.zoom.value };
    }
    drawBackground() {
        const segments = 10;
        const segHeight = this.height / segments / 3;
        this.ctx.strokeStyle = 'black';
        for (let index = 0; index <= segments; index++) {
            if (index % 5 == 0)
                this.ctx.lineWidth = 2;
            else
                this.ctx.lineWidth = 1;
            let start = this.calculateXandY({ time: this.padding, value: index * segHeight * 3 }, false);
            // start = {x: start.x, y: start.y - this.padding};
            if (start.y < 0)
                break;
            this.ctx.beginPath();
            this.ctx.moveTo(this.padding, start.y);
            this.ctx.lineTo(this.width - this.padding, start.y);
            // this.ctx.moveTo(this.padding,this.height-index*segHeight+1)
            // this.ctx.lineTo(this.width-this.padding, this.height-index*segHeight)
            this.ctx.fillText((this.maxValue - this.minValue) * (index * segHeight / 100) + this.minValue + ":", 0, start.y);
            this.ctx.stroke();
        }
    }
    normalizeValue(value, minValue, maxValue) {
        return (value - minValue) / (maxValue - minValue);
    }
    addLine(callback) {
        this.lines.push(callback(this));
    }
    drawLineAtValue(line) {
        const pos = this.calculateXandY(line.value);
        this.ctx.beginPath();
        this.ctx.strokeStyle = line.color;
        this.ctx.lineWidth = line.width;
        this.ctx.moveTo(this.padding, pos.y);
        this.ctx.lineTo(this.padding, pos.y);
        this.ctx.stroke();
    }
}
