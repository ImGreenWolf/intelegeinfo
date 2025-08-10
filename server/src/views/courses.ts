import express, { Request, Response } from 'express';
import path from 'path';
import { parseText, rootDirName, sendFile } from '../server';
import cookieParser from 'cookie-parser';
import { authMiddleware } from '../login';
import prisma from '../dbClient';
import { getIdFromJWT, getUserData } from '../usersManager';
import bodyParser from 'body-parser';


const router = express.Router();
export default router

var coursesPath = path.join(rootDirName, 'public', 'pages', 'courses') // rootDirName+'/public/pages/courses/'
const include =
{
    reviews: true,
    user: {
        omit: {
            password: true
        }
    }
}
type Course = Awaited<ReturnType<typeof getCourses>>[number]

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
    prisma.course.findFirst({
     where: 
     {
         user: {
             username
         }
     },
     include
    }).then(course => {
        res.contentType('html').send(createCoursePage(course, req))
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
        const user = await getUserData(getIdFromJWT(req))
        if(!user)
            throw 'Please login first.'

        sendFile(path.join(coursesPath, 'courses-create.html'), res, req, {user})

    } catch (error) {
        res.send('Pentru a publica un anunt, trebuie sa te loghezi, sau sa-ti faci un cont!')
    }
})


router.post('/create', (req, res) => {

    try {
        const id = getIdFromJWT(req)
        if(!id)
            throw 'invalid id'
        const {experience, price, description, courseLength, phone, instagram, email} = req.body as Record<string, string>
    
        prisma.course.create(
            {
                data:
                {
                    user: {
                        connect:
                        {
                            id
                        }
                    },
                    description,
                    experience,
                    price: parseInt(price),
                    courseLength: parseInt(courseLength),
                    phone,
                    external: [instagram],
                    email,

                },
                include:
                {
                    user: true
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

router.post('/create', (req, res) => {

    try {
        const id = getIdFromJWT(req)
        if(!id)
            throw 'invalid id'
        const {experience, price, description, courseLength, phone, instagram, email} = req.body as Record<string, string>
    
        prisma.course.create(
            {
                data:
                {
                    user: {
                        connect:
                        {
                            id
                        }
                    },
                    description,
                    experience,
                    price: parseInt(price),
                    courseLength: parseInt(courseLength),
                    phone,
                    external: [instagram],
                    email,

                },
                include:
                {
                    user: true
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
    
    return `
    <a class='${className}' href='/courses/by/${course.user.username}/'>
        <img src='/user/picture/${course.user.id}'>
        <h1>${course.user.firstName} ${course.user.lastName}</h1>
        ${starRatingHTML(course)}
        <h3>${course.experience}</h3>
        <div>
            <p>${course.description}</p>
        <div class='details'>
         <span>${course.courseLength} minute</span>
         <span>${course.price} Lei</span>
        </div>
        <button>
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
    
return parseText(`<!DOCTYPE html>
    <html lang="en-US, en, ro-RO, ro">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${course.user.username}</title>
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
                <div>
                    <h2>Despre acest curs</h2>
                    ${course.description}
                </div>
                <div class='action-container'>
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
                        </script>
                    
                    
                    <button>
                        Contacteaza
                    </button>
                </div>
            </div>
            <div class='details-container'>
                <h2>Detalii curs</h2>
                <p>${course.courseLength} minute</p>
                <p>${course.price} Lei</p>
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



