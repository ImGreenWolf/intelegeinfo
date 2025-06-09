"use strict";
const monitoredValues = [];
function UpdateProcessValues(json, index) {
    for (const monitor of monitoredValues) {
        let lastObjValue = json;
        for (const key of monitor.value.split('.'))
            lastObjValue = lastObjValue[key];
        document.getElementById(monitor.value + '-' + index).innerHTML = monitor.update(monitor.value, lastObjValue);
    }
}
function addMonitor(value, index, calback) {
    const name = getName(value);
    const cell = document.createElement('td');
    monitoredValues.push({ value, cell, update: calback });
    cell.id = value + '-' + index;
    cell.innerHTML = calback(name, "Updating...");
    document.getElementById('table-' + index)?.appendChild(cell);
    // addMonitorToTable(, cell)
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
                addMonitor('monit.cpu', k, (name, value) => {
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
    fetch('metrics/api').then(res => res.json())
        .then(res => {
        let k = 0;
        for (const table of res)
            UpdateProcessValues(table, k++);
    }).catch(err => window.alert(err));
}
