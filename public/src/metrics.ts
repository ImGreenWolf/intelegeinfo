const monitoredValues: {value: string, cell: HTMLTableCellElement, update: (name, value) => string}[] = []

function UpdateProcessValues(json)
{ 
        for(const monitor of monitoredValues)
        {
            let lastObjValue = json
            for(const key of monitor.value.split('.'))
                lastObjValue = lastObjValue[key]

            document.getElementById(monitor.value as string)!.innerHTML = monitor.update(monitor.value,lastObjValue)
        }   
        
     
}

function addMonitor(value: string, index, calback: (name, value) => string)
{
    const name = getName(value as string)
    const cell = document.createElement('td')
    monitoredValues.push({value, cell, update: calback})
    cell.id = value
    cell.innerHTML = calback(name, "Updating...")
    document.getElementById('table-'+index)?.appendChild(cell)
    // addMonitorToTable(, cell)
    
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

                addMonitor('monit.cpu', k, (name, value)=> {

                    return `<h1>${name}</h1>
                    <p>${value}</p>`
                })



                UpdateProcessValues(process)
                k++;
            }

            resolve()
        }).catch(err => reject(err))
    })
    
    

}




function updateLoop()
{
    

        fetch('metrics/api').then(res => res.json())
        .then(res => {
            UpdateProcessValues(res)
        }).catch(err => window.alert(err))
        
}