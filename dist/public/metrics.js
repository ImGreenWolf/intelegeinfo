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
    new Graph(value, cell, 0, 100);
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
                    Graphs.get(name)?.updateGraph(value, globalTime);
                    return `<h1>${name}</h1>
    <p>${value}%</p>`;
                });
                addMonitor('pm2_env', k, (name, value) => {
                    return `<h1>${name}</h1>
    <p>${value.status}</p>
    <p>${value.restart_time}</p>`;
                });
                UpdateProcessValues(process, k);
                k++;
            }
            resolve();
        }).catch(err => reject(err));
    });
}
function updateLoop() {
    globalTime += 3;
    fetch('metrics/api').then(res => res.json())
        .then(res => {
        let k = 0;
        for (const table of res)
            UpdateProcessValues(table, k++);
    }).catch(err => window.alert(err));
}
const Graphs = new Map();
class Graph {
    canvas = document.createElement('canvas');
    ctx = this.canvas.getContext('2d');
    time = 0;
    minValue;
    maxValue;
    height = 300;
    points = [];
    constructor(name, parent, minValue, maxValue) {
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.ctx.moveTo(0, 0);
        this.canvas.width = 300;
        this.canvas.height = this.height;
        this.ctx.lineWidth = 10;
        parent.appendChild(this.canvas);
        Graphs.set(name, this);
    }
    updateGraph(value, time) {
        this.time = time;
        this.points.push({ value, time });
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.beginPath();
        for (const point of this.points)
            this.ctx?.lineTo(point.time, this.height - (this.normalizeValue(point.value, this.minValue, this.maxValue)) * 10);
        this.ctx.stroke();
    }
    normalizeValue(value, minValue, maxValue) {
        return (value - minValue) / (maxValue - minValue);
    }
}
