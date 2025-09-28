

const React = window.React
const ReactDOM = window.ReactDOM
import { $Enums, Assignment, Class, Problem, Solve, User } from "../../../generated/prisma";
import { JsonValue } from "../../../generated/prisma/runtime/library";
import * as teacherScript from "./teacher.js";

// --- Types from your code ---


declare const Sqids: any;
const sqids = new Sqids({
  minLength: 6,
  alphabet: "abcdefghijklmnopqrstuvwxyz",
});

// ----------------------------

export default function main () {
      //@ts-expect-error
      const root = ReactDOM.createRoot(document.getElementById('class-details')!);
      root.render(<ClassesApp/>);
}

 function ClassesApp() {
  const [userClasses, setUserClasses] = React.useState<{ classes: Class[]; user: User } | null>(null);
  const [selectedClass, setSelectedClass] = React.useState<Class | undefined>(undefined);
  const [cache] = React.useState<Map<number, Class_>>(new Map());
  const [json, setJson] = React.useState<Class_ | null>(null);
  const [userActive, setUserActive] = React.useState<WebSocket | null>(null);

  const searchParams = new URLSearchParams(location.search);

  // Run main() once
  React.useEffect(() => {
    async function main() {
      const data = await updateClassList();
      setUserClasses(data);

      let classIndex = 0;
      if (searchParams.has("class") && searchParams.get("class")!.length >= 6) {
        classIndex = data.classes.findIndex(
          (c) => c.id === sqids.decode(searchParams.get("class"))[0]
        );
      }

      const selected = data.classes[classIndex === -1 ? 0 : classIndex];
      if (selected) {
        load(selected);
      }
    }

    main();
  }, []);

  async function updateClassList(
    classes?: { classes: Class[]; user: User }
  ): Promise<{ classes: Class[]; user: User }> {
    const jsonData =
      classes ??
      ((await (await fetch("/classes/u")).json()) as { classes: Class[]; user: User });
    setUserClasses(jsonData);
    return jsonData;
  }

  function calcTextColor(bgColor: string) {
    let sum = 0;
    for (let i = 0; i < bgColor.length - 2; i++) {
      sum += parseInt(bgColor.substring(i, i + 2), 8);
    }
    return sum / 3 < 255 / 2 ? "ffffff" : "000000";
  }

  async function load(loadClass: Class) {
    if (json && json.id === loadClass.id) return;

    const classPath = `/classes/c/${loadClass.id}/${loadClass.name.replaceAll(" ", "-")}`;

    if (!cache.has(loadClass.id)) {
      const loadedClass = (await (
        await fetch(`/classes/c/${loadClass.id}/${loadClass.name.replaceAll(" ", "-")}`)
      ).json()) as Class_;
      loadedClass.classPath = classPath;
      cache.set(loadClass.id, loadedClass);
    }

    const loaded = cache.get(loadClass.id)!;
    setJson(loaded);
    setSelectedClass(loadClass);

    const encodedString = sqids.encode([loaded.id.toString()]);
    searchParams.set("class", encodedString);
    history.pushState(
      { class: encodedString },
      loaded.name,
      location.pathname + "?" + searchParams.toString()
    );

    if (userClasses) {
      updateClassList(userClasses);
    }

    if (userActive && userActive.OPEN) userActive.close();
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

  return (
    <div className="classes-app">
      {/* Class list */}
      {userClasses && (
        <ClassList
          classes={userClasses.classes}
          user={userClasses.user}
          selectedClass={selectedClass}
          onSelect={(c) => load(c)}
        />
      )}

      {/* Class details */}
      {json && <ClassDetails classData={json} isOwner={json.isOwner} />}
    </div>
  );
}

// ----------------------------
// Subcomponents

function ClassList({
  classes,
  user,
  selectedClass,
  onSelect,
}: {
  classes: Class[];
  user: User;
  selectedClass: Class | undefined;
  onSelect: (c: Class) => void;
}) {
  return (
    <div id="list">
      {classes.map((c) => {
        let classList = "";
        if (selectedClass && c.id === selectedClass.id) classList += " selected";
        if (c.creatorId === user.id) classList += " owner";

        return (
          <button
            key={c.id}
            className={classList}
            style={{ ["--bgColor" as any]: `#${c.color}` }}
            onClick={() => onSelect(c)}
          >
            {c.name}
          </button>
        );
      })}
    </div>
  );
}

function ClassDetails({ classData, isOwner }: { classData: Class_; isOwner: boolean }) {
  const textColor = "#" + (classData.color ? calcTextColor(classData.color) : "000000");

  return (
    <div
      id="class-details"
      style={
        {
          ["--classColor" as any]: `#${classData.color}`,
          ["--textColor" as any]: textColor,
        } as React.CSSProperties
      }
    >
      <div className="header-container">
        <h2>{classData.name}</h2>
        <div id="flex-header">
          <span>{classData._count.Assignments} teme</span>
        </div>
      </div>

      {classData.description && !isOwner && (
        <div>
          <h3>Descriere</h3>
          <p>{classData.description}</p>
        </div>
      )}

      {/* TODO: render assignments, people list, share button, etc. */}
    </div>
  );

  function calcTextColor(bgColor: string) {
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
    
}

export function dateDeltaToString(date: Date, capitalize=true, language='ro-RO')
{
    
    function formatTime(time: number, unit: keyof typeof TimeUnit)
    {
        switch(language)
        {
            case 'ro-RO':
             return `${capitalize ? "A" : 'a'}cum ${time} ${TimeUnit[unit][language]}`
            case 'en-US':
             return `${time} ${TimeUnit[unit][language]} ago`
        }
       
    }
    const now = new Date() 

    // Calculate the difference in seconds
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffMonth = (now.getUTCFullYear() - date.getUTCFullYear()) * 12 + (now.getUTCMonth() - date.getUTCMonth());
    const diffYear = now.getUTCFullYear() - date.getUTCFullYear();

    if(diffYear >= 1)
        return formatTime(diffYear, 'years')
    else if(diffMonth >= 1)
        return formatTime(diffMonth, 'months')
    else if(diffDay >= 1)
        return formatTime(diffDay, 'days')  
    else if(diffHour >= 1)
        return formatTime(diffHour, 'hours')  
    else if(diffMin >= 1)
        return formatTime(diffMin, 'minutes')  
    else
        return formatTime(diffSec, 'seconds')
}



export type Class_ = {
    Creator: {
        id: number;
        username: string;
        firstName: string;
        lastName: string;
        email: string;
        emailValidated: boolean;
        userColor: string;
        picture: string;
        role: $Enums.Role;
        createdAt: Date;
        activeAt: Date;
        authId: JsonValue | null;
        loginMethod: string;
        occupationType: $Enums.OccupationType;
    };
    Students: {
        userId: number;
        classId: number;
        User: {
            id: number;
            username: string;
            firstName: string;
            lastName: string;
            email: string;
            emailValidated: boolean;
            userColor: string;
            picture: string;
            role: $Enums.Role;
            createdAt: Date;
            activeAt: Date;
            password: string | null;
            authId: JsonValue | null;
            loginMethod: string;
            occupationType: $Enums.OccupationType;
            solves: Solve[]
        };
    }[];
    Assignments: {
        id: number;
        description: string | null;
        createdAt: Date;
        classId: number;
        problemId: number | null;
        title: string;
        dueDate: Date | null;
        Problem: any
    }[];
    _count: {
        Creator: number;
        Students: number;
        Assignments: number;
    };
} & 
{
    mySolves: {
        id: number;
        userId: number;
        problemid: number;
        sourceCode: string;
        uploadedAt: Date;
        score: number;
        time: number;
    }[]
} &
{
    id: number;
    createdAt: Date;
    name: string;
    description: string;
    creatorId: number;
    isOwner: boolean
    color: string,
    classPath: string
    myAssignments: (Assignment & {
        Problem: Problem
    })[]
}
type SolveWithUser = ({
                user: {
                    id: number;
                    username: string;
                    userColor: string;
                };
            } & {
                id: number;
                sourceCode: string;
                userId: number;
                problemId: number;
                uploadedAt: Date;
                score: number;
                time: number;
            })[];
type Assignments = {
    assign: {
        Problem: {
            solves: SolveWithUser
        };
    } & {
        id: number;
        description: string;
        createdAt: Date;
        classId: number;
        problemId: number;
        title: string;
    };
    averageScore: number;
    averageAttempts: string;
}


