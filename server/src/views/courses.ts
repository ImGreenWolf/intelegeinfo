import express, { Request, Response } from 'express';
import path from 'path';
import { parseText, rootDirName, sendFile } from '../server';
import cookieParser from 'cookie-parser';
import { authMiddleware } from '../login';
import prisma from '../dbClient';
import { createUploadFromFile, getClientJWTValue, getIdFromJWT, getJWT, getUserData, transporter, upload } from '../usersManager';
import bodyParser from 'body-parser';
import { Inquiry, Prisma } from '../../../generated/prisma';
import { dateDeltaToString } from '../problemManager';
import nodemailer from 'nodemailer'

const router = express.Router();
export default router

var coursesPath = path.join(rootDirName, 'public', 'pages', 'courses') // rootDirName+'/public/pages/courses/'
const include =
{
    reviews: true,
    inquiries: true,
    user: {
        omit: {
            password: true
        }
    }
}

type Course = Prisma.CourseGetPayload<{include: typeof include}>
router.use(cookieParser())
router.use(bodyParser.json() );       // to support JSON-encoded bodies
router.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 



router.get('/', async (req, res) => {

    sendFile(path.join(coursesPath, 'courses.html'), res, req, {courses: await createList(), coursesCarousel: await createList('course-carousel-element', 5)})
})

router.get('/by/:username', async (req, res) => {
    const username = decodeURI(req.params.username)

   try {
    if(!username)
        throw 'invalid username'
    const user = await prisma.user.findFirst({
        where: {
            username
        }
    })
    prisma.course.update({
     where: 
     {
        userId: user.id
     },
     data: {
        views: {
            increment: 1
        }
     },
     include
    }).then(course => {
        res.contentType('html').send(createCoursePage(course, req))
    }).catch(err => {
        throw err
    })


   } catch (error) {
        res.send(error)
   }
})

router.get('/by/:username/contact', async (req, res) => {
    const username = decodeURI(req.params.username)

   try {
    if(!username)
        throw 'invalid username'
    const user = await getUserData(getIdFromJWT(req))
    const course = await prisma.course.findFirst({where: {user: {username: {equals: username}}}, include})
    
    sendFile(path.join(coursesPath, 'courses-contact.html'), res, req, {course, user: user})

   } catch (error) {
        res.send(error)
   }
})

router.post('/by/:username/contact', async (req, res) => {
    const username = decodeURI(req.params.username)

   try {
    if(!username)
        throw 'invalid username'
        const {email, phone, other, firstName, lastName, message} = req.body
    const course = await prisma.course.findFirst({where: {user: {username: {equals: username}}}, include})
    
    prisma.course.update({
        where: {
            id: course.id
        },
        data: {
            inquiries: {
                create: {
                    userId: getIdFromJWT(req),
                    contactInfo: {
                        email,
                        phone,
                        other
                    },
                    message,
                    firstName,
                    lastName
                }
            }
        },
        include: {
            user: true
        }
    }).then(course => {
        var mailOptions: nodemailer.SendMailOptions  = {
            from: 'Intelegeinfo <noreply@intelegeinfo.ro>',
            to: course.email,
            subject: `Ai o cerere noua de meditat de la ${firstName}!`,
            // html: callbackFile,
            html: `
            Salut, ${course.user.firstName}.

            Ai primit o noua cerere de meditat de la ${firstName} ${lastName} prin intelegeinfo.ro!

            Intra in <a href='https://intelegeinfo.ro/courses/by/${course.user.username}/dashboard'>dashboard</a> pentru a accepta si a vedea detaliile de contact!

            Pentru orice neintelege sau intrebare, contactati-ne la adresa de email <a href='mailto:office@intelegeinfo.ro'>office@intelegeinfo.ro</a>
            
            `
            ,

        };

        transporter.sendMail(mailOptions).then(msg => res.send('Am trimis mesajul tau!'))
        
    })

   } catch (error) {
        res.send(error)
   }
})

router.get('/by/:username/dashboard', async (req, res) => {
    const username = decodeURI(req.params.username)

   try {
    if(!username)
        throw 'invalid username'
    const id = getIdFromJWT(req)
    if(!id)
        throw 'invalid token id'
    prisma.course.findFirst({
    where: 
     {
        userId: id
     },
    include:
    {
        inquiries:  {include: {user: true}},
        reviews: true,
        user: true
    }
    }).then(course => {
        if(course.userId != id && getClientJWTValue(getJWT(req)).role !== 'ADMIN')
            throw 'Nu ai permisiunea sa vezi aceasta pagina!'
        res.contentType('html').send(createCourseDashboardPage(course, req))
    }).catch(err => {
        throw err
    })


   } catch (error) {
        res.send(error)
   }
})

router.get('/by/:username/dashboard/accept', async (req, res) => {
    const username = decodeURI(req.params.username)
    
   try {
    if(!username)
        throw 'invalid username'
    const userId = getIdFromJWT(req)
    if(!userId)
        throw 'invalid token id'
    const id = parseInt(req.query.id as string)
    prisma.course.findFirst({
    where: 
     {
        userId
     }
    }).then(course => {
        if(course.userId != userId && getClientJWTValue(getJWT(req)).role !== 'ADMIN')
            throw 'Nu ai permisiunea sa realizezi aceasta actiune!'
            prisma.inquiry.update({
                where: {
                    id
                },
                data: {
                    response: true,
                    respondedAt: new Date()
                }
            }).then(inquiry => {
                res.redirect('./dashboard')
            }).catch(err => {
                throw err
            })
       
    }).catch(err => {
        throw err
    })


   } catch (error) {
        res.send(error)
   }
})

router.get('/by/:username/dashboard/reject', async (req, res) => {
    const username = decodeURI(req.params.username)
    
   try {
    if(!username)
        throw 'invalid username'
    const userId = getIdFromJWT(req)
    if(!userId)
        throw 'invalid token id'
    const id = parseInt(req.query.id as string)
    prisma.course.findFirst({
    where: 
     {
        userId
     }
    }).then(course => {
        if(course.userId != userId && getClientJWTValue(getJWT(req)).role !== 'ADMIN')
            throw 'Nu ai permisiunea sa realizezi aceasta actiune!'
            prisma.inquiry.delete({
                where: {
                    id
                }
               
            }).then(() => {
                res.send({succes: true})
            }).catch(err => {
                throw err
            })
       
    }).catch(err => {
        throw err
    })


   } catch (error) {
        res.send(error)
   }
})

router.post('/by/:username/review', async (req, res) => {

    try {
        const id = getIdFromJWT(req)
        if(!id)
            throw 'invalid id'
        
        const username = decodeURI(req.params.username)

        if(!username)
            throw 'invalid username'
        const {rating, motive} = req.body
        if(!rating)
            throw 'Please provide a rating'

        const course = await prisma.course.findFirst({
        where: 
        {
            user: {
                username
            }, 
            
        },
        include
        })
        if(!course)
            throw 'invalid course'
        prisma.review.upsert({
             where: {
                userId_courseId: {
                    userId: id,
                    courseId: course.id
                }
            },
            create:
            {
                userId: id as number,
                courseId: course.id,
                rating: rating,
                motive: motive,
            },
            update: {
                rating: rating,
                motive: motive,
            },
            include:
            {
                course: {
                    include
                }
            }
        }).then(review => {
            res.send(JSON.stringify({rating: review.rating, averageRating: calculateRating(review.course)}))
        })


   
    } catch (err) {
        console.error(err)
        res.status(500).send(err)
    }
})

router.get('/create', async (req, res) => {
    try {
        const user = await getUserData(getIdFromJWT(req), {Course: true})
        if(!user)
            throw 'Trebuie sa fi logat'
        if(!user.emailValidated)
            throw `Trebuie sa-ti <a href="/user/verifyEmail?id=${user.id}">validezi emailul</a> prima data!`
        sendFile(path.join(coursesPath, 'courses-create.html'), res, req, {user, course: (user as any).Course})

    } catch (error) {
        res.send('Pentru a publica un anunt, trebuie sa te loghezi, sau sa-ti faci un cont!')
    }
})




router.post('/create', upload.single('videoSummary'), (req, res) => {

    try {
        const id = getIdFromJWT(req)
        if(!id)
            throw 'invalid id'
        const {experience, price, description, summary, courseLength, phone, external, email} = req.body as Record<string, string>

        prisma.course.upsert(
            {
                create:
                {
                    user: {
                        connect:
                        {
                            id
                        }
                    },
                    videoSummary: createUploadFromFile(req, id),
                    description,
                    experience,
                    price: parseInt(price),
                    courseLength: parseInt(courseLength),
                    phone,
                    external,
                    email,

                },
                include:
                {
                    user: true
                }
                ,
                where:
                {
                    userId: id
                },
                update:
                {
                    description,
                    summary,
                    experience,
                    price: parseInt(price),
                    courseLength: parseInt(courseLength),
                    phone,
                    external,
                    email,
                    updatedAt: new Date(),
                    videoSummary: req.file ? {
                        create: {
                            path: req.file.filename,
                            size: req.file.size,
                            originalName: req.file.originalname,
                            UserId: id
                        }                        
                    } : undefined,
                }
            }).then(val => {
                res.send('Created')
            }).catch(err => {
                console.error(err)
                res.status(500).send(err)
            })
    } catch (err) {
        console.error(err)
        res.status(500).send(err)
    }
})


router.get('/list', (req, res) => {
    res.contentType('html').send(createList())
})

async function getCourses(take=10)
{
        return await prisma.course.findMany({
            take,
            include
         })
    
    
}

async function createList(className?: string, take?, courses?: Awaited<ReturnType<typeof getCourses>>)
{  
    if(!courses)
        courses= await getCourses(take);
    if(!courses)
        return 'Inca nu a publicat nimeni un anunt. Fi tu primul!'
    let html = '';
    for(const course of courses)
    {
        html += createCourseElement(course, className)
    }

    return html
}
function calculateRating(course: Course)
{
    if(!course.reviews)
        return -1
    if(course.reviews.length==0)
        return 0;
    let average = 0
    for(const review of course.reviews)
    {
        average += review.rating
    }
    return average/course.reviews.length
}

function createCourseElement(course: Course, className='course-element')
{
    
return /*html*/`
<a class='${className}' href='/courses/by/${course.user.username}/'>
    <img src='/user/picture/${course.user.id}'>
    <h1>${course.user.firstName} ${course.user.lastName}</h1>
    ${starRatingHTML(course)}
    <h3>${course.experience}</h3>
    <div>
        <p>${course.summary.substring(0, 300)}</p>
    <div class='details'>
        <span>${course.courseLength} minute</span>
        <span>${course.price} Lei</span>
    </div>
    <button class='action-button'>
        ${course.phone.slice(0, 6) + 'x'.repeat(course.phone.length-4)}
    </button>
    </div>
</a>
`;
}

function starRatingHTML(course, stars?)
{
    if(!stars)
        stars = calculateRating(course)
    return `<div class='star-rating-container'>
                        
        <svg viewBox="0 0 576 512" width="100" title="star">
        <path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z" />
        </svg><svg viewBox="0 0 576 512" width="100" title="star">
        <path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z" />
        </svg><svg viewBox="0 0 576 512" width="100" title="star">
        <path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z" />
        </svg><svg viewBox="0 0 576 512" width="100" title="star">
        <path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z" />
        </svg><svg viewBox="0 0 576 512" width="100" title="star">
        <path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z" />
        </svg>

        <div class="cover" style="width: ${100 - stars*100/5}%;"></div>
        <p id='rating'>${calculateRating(course)}</p>
    </div>`
}


function createCoursePage(course: Course, req)
{
    if(!course || !course.user)
        throw 'invalid author user'

    const userId = getIdFromJWT(req)
return parseText(
    /*html*/
`<!DOCTYPE html>
<html lang="en-US, en, ro-RO, ro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meditatii de la ${course.user.username}</title>
    <meta name="description" content="${course.description}">
    <meta name="keywords" content="Meditatii, cursuri online">
    <link rel="stylesheet" href="/css/courses.css">
    <link rel="stylesheet" href="/css/main.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@200..700&family=Playwrite+DK+Loopet:wght@100..400&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Teachers:ital,wght@0,400..800;1,400..800&display=swap" rel="stylesheet">

</head>

<body>

    ^{&file:_header.html}
    <div class='course-page-grid'>
        <div class='video-container'>
            ${course.summaryPath ? `<video src="/user/upload/${course.summaryPath}" controls></video>` : ''}
            <div>
                <img class='profile' src='/user/picture/${course.userId}'>
                <p>${course.experience}</p>
                <h1>${course.user.firstName} ${course.user.lastName}</h1>
            </div>
        </div>
        <div class='content-container'>
            <h2>Despre acest curs</h2>
            <div class='description-container'>
                
                <p>${course.description}</p>
            </div>

            <div class='action-container'>
                <button onclick='this.classList.toggle("open")' class='bulletpoint-button'>
                    •••
                    <div>
                        <div onclick='share()'>Distribuie</div>
                        <div onclick='report()' style='color: red'>Raporteaza</div>
                    </div>
                </button>

                ${starRatingHTML(course)}

                <script>
                    for(const star of document.getElementsByClassName('star-rating-container'))
                        {
                            const cover = star.querySelector('.cover')
                            star.onclick = (ev) => {
                                let index=0;
                                if(ev.target == cover)
                                return
                                for(const elem of star.children)
                                {
                                    index++
                                    if(elem == ev.target.parentElement)
                                    {
                                        function calc(val)
                                        {
                                            cover.style.width = star.getBoundingClientRect().left - elem.getBoundingClientRect().left - elem.getBoundingClientRect().width + star.clientWidth + 'px'; //(100- val / (star.children.length-2) *100) + "%";
                                        }
                                        calc(index)

                                        fetch(!location.href.endsWith('/') ? location.href+'/review' : 'review', {
                                            method: 'post', 
                                            headers: {
                                            'Accept': 'application/json',
                                            'Content-Type': 'application/json'
                                            },
                                            body: JSON.stringify( 
                                            {
                                                rating: index
                                            })
                                        }).then(res => {return res.json()})
                                        .then(res => {
                                            calc(res.rating)
                                            document.getElementById('rating').innerText = res.averageRating
                                        }).catch(err => {
                                            calc(0)
                                        })
                                        break;
                                    }
                                    
                                }
                                    
                            }
                        }

                        function share()
                        {
                            navigator.share({title: 'Inscriete la orele de meditatii a lui ${course.user.firstName} ${course.user.lastName}', text: '${course.summary}', url: location.toString()})
                        }
                        function report()
                        {
                            window.alert('Pentru sesizari, trimiteti un email la office@intelegeinfo.ro si va vom raspunde in cel mai scurt timp posibil! Va multumim.')
                        }
                        function openPage(page)
                        {
                            location.href = location.href.endsWith('/') ? location.href + page : location.href + '/' + page
                        }
                    </script>
                
                ${userId && course.userId == userId ? `<button class='action-button' onclick='openPage("dashboard")'>
                    Dashboard
                </button>` : ''}
                <button class='action-button' onclick='openPage("contact")'>
                    Contacteaza
                </button>
            </div>
        </div>
        <div class='details-container'>
            <h2>Detalii curs</h2>
            <div class='pricing'>
                <p>${course.courseLength} minute</p>
                <p>${course.price} Lei</p>
                <p>${Math.round(course.price/(course.courseLength/60))} lei/ora</p>
            </div>
            <h2>Linkuri externe</h2>
            <div class='external-links'>
                ${JSON.parse(course.external as string).links.map(link => `<a href='${link.value}'>${link.name}</a>`).join('\n')}
            </div>  
            <div>

            </div>
        </div>
    </div>
    <script>
        const video = document.querySelector("video");

        video.addEventListener("play", () => {
            video.classList.add("is-playing");
        });

        video.addEventListener("pause", () => {
            video.classList.remove("is-playing");
        });

        
    </script>
</body>
</html>
`, req)
    
   
}

function createInquiryElement(inquiry: Prisma.InquiryGetPayload<{include: {user: true}}>)
{
    return `<div class='inquiry-element'>
        <h3>Cerere de la ${inquiry.firstName} ${inquiry.lastName}</h3>
        Primit ${dateDeltaToString(new Date(inquiry.createdAt), false) }<span>
        <button class='add' onclick='acceptInquiry(${inquiry.id})'>Accepta</button>
        <button class='remove' onclick='rejectInquiry(${inquiry.id})'>Ignora</button>
        <div>
            <p>${inquiry.message}</p>
            <p>${inquiry.user ? `Are cont.` : 'Nu are cont.'}</p>
        </div>
        </div>`
}
function createStudentElement(inquiry: Prisma.InquiryGetPayload<{include: {user: true}}>)
{
    return `<div class='inquiry-element'><h3>${inquiry.firstName} ${inquiry.lastName}</h3>
    Elev de ${dateDeltaToString(new Date(inquiry.respondedAt), false) }<span><button class='remove' onclick='rejectInquiry(${inquiry.id})'>Scoate</button></div>`
}


function createCourseDashboardPage(course: Prisma.CourseGetPayload<{include: {inquiries: {include: {user: true}}, reviews: true, user: true}}>, req) {

    const toBeResponded = course.inquiries.filter(inquiry => !inquiry.response);
return parseText(
    /*html*/
`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboardul lui ${course.user.firstName}</title>

    <link rel="stylesheet" href="/css/courses-dashboard.css">
        <link rel="stylesheet" href="/css/main.css">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@200..700&family=Playwrite+DK+Loopet:wght@100..400&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Teachers:ital,wght@0,400..800;1,400..800&display=swap" rel="stylesheet">

</head>
<body>
    ^{&file:_header.html}


    <script>
        function acceptInquiry(inquiryId) {
            fetch('./dashboard/accept?id='+inquiryId).then(() => location.reload())
        }
        function rejectInquiry(inquiryId) {
            fetch('./dashboard/reject?id='+inquiryId).then(() => location.reload())
        }
    </script>
    <div class='dashboard-grid'>
        <div class='information'>
            <h2>${['Noapte buna', 'Buna dimineata', 'Buna ziua', 'Buna seara' ][Math.round(new Date().getHours()/8)]}, ${course.user.firstName}</h2>
            <p>Anuntul tau are ${course.views} vizualizari</p>
            <a href='/courses/by/${course.user.username}/'>Inapoi la pagina cursului</a>
            <a href='/courses/create'>Editeaza</a>
        </div>
        <div class='inquiries'>
            ${toBeResponded.length == 0 ? 'Nimic momentam.. Te vom contacta cand primesti o noua cerere' : ''}
            ${toBeResponded.map(inquiry => createInquiryElement(inquiry)).join('\n')}
        </div>
        <div class='students'>

            ${course.inquiries.filter(inquiry => inquiry.response).map(inquiry => createStudentElement(inquiry)).join('\n')}
        </div>
    </div>
</body>
</html>
    `, req)
}