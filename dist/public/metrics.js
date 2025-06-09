"use strict";
const monitoredValues = [];
function UpdateValues(json) {
    for (const monitor of monitoredValues) {
        let lastObjValue = json;
        for (const key of monitor.value.split('.'))
            lastObjValue = lastObjValue[key];
        document.getElementById(monitor.value).innerHTML = lastObjValue;
    }
}
function addMonitor(value, calback) {
    const name = getName(value);
    monitoredValues.push({ value, update: calback });
    const cell = document.createElement('td');
    cell.id = value;
    cell.innerHTML = calback(name, "Updating...");
    document.getElementById('table')?.appendChild(cell);
}
function getName(value) {
    const tree = value.split('.');
    return tree.includes('.') ? tree[tree.length - 1] : tree[0];
}
function search(path, obj, target) {
    for (var k in obj) {
        if (obj.hasOwnProperty(k))
            if (obj[k] === target)
                return path + "['" + k + "']";
            else if (typeof obj[k] === "object") {
                var result = search(path + "['" + k + "']", obj[k], target);
                if (result)
                    return result;
            }
    }
    return false;
}
addMonitor('monit.cpu', (name, value) => {
    return `<h1>${name}</h1>
    <p>${value}</p>`;
});
updateLoop();
function updateLoop() {
    setInterval(() => {
        fetch('api').then(res => res.json())
            .then(res => {
            UpdateValues(res);
        });
    }, 300);
}
