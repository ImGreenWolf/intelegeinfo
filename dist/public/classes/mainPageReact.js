const React = window.React;
const ReactDOM = window.ReactDOM;
import * as teacherScript from "./teacher.js";
const sqids = new Sqids({
    minLength: 6,
    alphabet: "abcdefghijklmnopqrstuvwxyz",
});
// ----------------------------
export default function main() {
    //@ts-expect-error
    const root = ReactDOM.createRoot(document.getElementById('class-details'));
    root.render(React.createElement(ClassesApp, null));
}
function ClassesApp() {
    const [userClasses, setUserClasses] = React.useState(null);
    const [selectedClass, setSelectedClass] = React.useState(undefined);
    const [cache] = React.useState(new Map());
    const [json, setJson] = React.useState(null);
    const [userActive, setUserActive] = React.useState(null);
    const searchParams = new URLSearchParams(location.search);
    // Run main() once
    React.useEffect(() => {
        async function main() {
            const data = await updateClassList();
            setUserClasses(data);
            let classIndex = 0;
            if (searchParams.has("class") && searchParams.get("class").length >= 6) {
                classIndex = data.classes.findIndex((c) => c.id === sqids.decode(searchParams.get("class"))[0]);
            }
            const selected = data.classes[classIndex === -1 ? 0 : classIndex];
            if (selected) {
                load(selected);
            }
        }
        main();
    }, []);
    async function updateClassList(classes) {
        const jsonData = classes ??
            (await (await fetch("/classes/u")).json());
        setUserClasses(jsonData);
        return jsonData;
    }
    function calcTextColor(bgColor) {
        let sum = 0;
        for (let i = 0; i < bgColor.length - 2; i++) {
            sum += parseInt(bgColor.substring(i, i + 2), 8);
        }
        return sum / 3 < 255 / 2 ? "ffffff" : "000000";
    }
    async function load(loadClass) {
        if (json && json.id === loadClass.id)
            return;
        const classPath = `/classes/c/${loadClass.id}/${loadClass.name.replaceAll(" ", "-")}`;
        if (!cache.has(loadClass.id)) {
            const loadedClass = (await (await fetch(`/classes/c/${loadClass.id}/${loadClass.name.replaceAll(" ", "-")}`)).json());
            loadedClass.classPath = classPath;
            cache.set(loadClass.id, loadedClass);
        }
        const loaded = cache.get(loadClass.id);
        setJson(loaded);
        setSelectedClass(loadClass);
        const encodedString = sqids.encode([loaded.id.toString()]);
        searchParams.set("class", encodedString);
        history.pushState({ class: encodedString }, loaded.name, location.pathname + "?" + searchParams.toString());
        if (userClasses) {
            updateClassList(userClasses);
        }
        if (userActive && userActive.OPEN)
            userActive.close();
        const ws = new WebSocket("/classes?id=" + loaded.id);
        setUserActive(ws);
        ws.onmessage = (ev) => {
            const body = JSON.parse(ev.data);
            // handle active users update here (React state instead of DOM classList)
        };
        // If owner, load teacher script (imperative interop)
        if (loaded.isOwner) {
            teacherScript.loadTeacher(loaded);
        }
    }
    return (React.createElement("div", { className: "classes-app" },
        userClasses && (React.createElement(ClassList, { classes: userClasses.classes, user: userClasses.user, selectedClass: selectedClass, onSelect: (c) => load(c) })),
        json && React.createElement(ClassDetails, { classData: json, isOwner: json.isOwner })));
}
// ----------------------------
// Subcomponents
function ClassList({ classes, user, selectedClass, onSelect, }) {
    return (React.createElement("div", { id: "list" }, classes.map((c) => {
        let classList = "";
        if (selectedClass && c.id === selectedClass.id)
            classList += " selected";
        if (c.creatorId === user.id)
            classList += " owner";
        return (React.createElement("button", { key: c.id, className: classList, style: { ["--bgColor"]: `#${c.color}` }, onClick: () => onSelect(c) }, c.name));
    })));
}
function ClassDetails({ classData, isOwner }) {
    const textColor = "#" + (classData.color ? calcTextColor(classData.color) : "000000");
    return (React.createElement("div", { id: "class-details", style: {
            ["--classColor"]: `#${classData.color}`,
            ["--textColor"]: textColor,
        } },
        React.createElement("div", { className: "header-container" },
            React.createElement("h2", null, classData.name),
            React.createElement("div", { id: "flex-header" },
                React.createElement("span", null,
                    classData._count.Assignments,
                    " teme"))),
        classData.description && !isOwner && (React.createElement("div", null,
            React.createElement("h3", null, "Descriere"),
            React.createElement("p", null, classData.description)))));
    function calcTextColor(bgColor) {
        let sum = 0;
        for (let i = 0; i < bgColor.length - 2; i++) {
            sum += parseInt(bgColor.substring(i, i + 2), 8);
        }
        return sum / 3 < 255 / 2 ? "ffffff" : "000000";
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
