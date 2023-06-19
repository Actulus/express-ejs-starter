import db from '../db/db.js';
import logger from '../utils/logging.js';
import UserModel from '../models/UserModel.js';

async function getLatestPosts(_req, _res, _next) {
    // Get a connection
    const conn = db.getConnection();
    const query = 'SELECT * FROM posts ORDER BY created_at DESC LIMIT 10';
    const [postResult, _columnDefinition] = await conn.query(query);
    // console.log(result);

    const usersQuery = 'SELECT * FROM users';
    const [usersResult, _usersColumnDefinition] = await conn.query(usersQuery);

    // get the writers based on the usersQuery and the postsQuery
    const writerResult = usersResult.filter((user) => {
        return postResult.some((post) => post.user_id === user.id);
    });

    // console.log(writerResult);

    const posts = postResult.map((post) => {
        const writer = writerResult.find((user) => user.id === post.user_id);
        let writer_profile_pic = writer ? writer.profile_pic : null;
        const writer_name = writer ? writer.name : null;
        const createdDate = new Date(post.created_at);
        const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
        const formattedDate = createdDate.toLocaleString('en-US', options);

        return {
            id: post.id,
            title: post.title,
            content: post.content,
            created_at: formattedDate,
            writer_profile_pic: writer_profile_pic,
            writer_name: writer_name,
        };
    });

    // console.log(`Latest posts: %o`, posts);

    return posts;
}

async function getAllPosts(_req, _res, _next) {
    // Get a connection
    const conn = db.getConnection();
    const query = 'SELECT * FROM posts ORDER BY created_at DESC';
    const [postResult, _columnDefinition] = await conn.query(query);

    const usersQuery = 'SELECT * FROM users';
    const [usersResult, _usersColumnDefinition] = await conn.query(usersQuery);

    // get the writers based on the usersQuery and the postsQuery
    const writerResult = usersResult.filter((user) => {
        return postResult.some((post) => post.user_id === user.id);
    });

    const posts = postResult.map((post) => {
        const writer = writerResult.find((user) => user.id === post.user_id);
        let writer_profile_pic = writer ? writer.profile_pic : null;
        const writer_name = writer ? writer.name : null;
        const createdDate = new Date(post.created_at);
        const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
        const formattedDate = createdDate.toLocaleString('en-US', options);

        return {
            id: post.id,
            title: post.title,
            content: post.content,
            created_at: formattedDate,
            writer_profile_pic: writer_profile_pic,
            writer_name: writer_name,
        };
    });

    return posts;
}

async function getPostsContaining(keyword) {
    // Get a connection
    const conn = db.getConnection();
    const query = `SELECT * FROM posts WHERE title LIKE '%${keyword}%' OR content LIKE '%${keyword}%'`;
    const [postResult, _columnDefinition] = await conn.query(query);

    const usersQuery = 'SELECT * FROM users';
    const [usersResult, _usersColumnDefinition] = await conn.query(usersQuery);

    const writerResult = usersResult.filter((user) => {
        return postResult.some((post) => post.user_id === user.id);
    });

    const posts = postResult.map((post) => {
        const writer = writerResult.find((user) => user.id === post.user_id);
        const writer_profile_pic = writer ? writer.profile_pic : 'default_pfp.jpg';
        const writer_name = writer ? writer.name : null;
        const createdDate = new Date(post.created_at);
        const formattedDate = createdDate.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });

        return {
            id: post.id,
            title: post.title,
            content: post.content,
            created_at: formattedDate,
            writer_profile_pic: writer_profile_pic,
            writer_name: writer_name
        };
    });

    // console.log(`Posts containing "${keyword}":`, posts);

    return posts;
}


function getUserForums() {
    return [
        {
            name: 'Programtervező informatikus',
        },
        {
            name: 'Gazdasági informatikus',
        },
        {
            name: 'Mérnök informatikus',
        },
    ];
}

function getUserChats() {
    return [
        {
            name: 'Programtervező informatikusok',
        },
        {
            name: 'Joan Doe'
        }
    ];
}

function newPost(req, res, _next) {
    // redirect to new post page
    res.redirect('/new-post');
}

async function dashboardPage(req, res, _next) {
    const isLoggedIn = !!req.cookies.token;

    if (!isLoggedIn) {
        // Handle the case where the user is not logged in
        return res.status(401).send("Unauthorized");
    }

    const userByToken = await UserModel.getUserByToken(req.cookies.token);
    const userID = userByToken.id;
    const user = await getUserById(userID);

    if (!user) {
        // Handle the case where the user is not found
        return res.status(404).send("User not found");
    }

    // console.log(`User: %o`, user);

    const { loggedIn } = req.body;
    const { search } = req.query;
    const userForums = getUserForums();
    const userChats = getUserChats();

    // get logged in user's profile picture, if it's not set, use default, otherwise get it from the database
    let profilePicture = loggedIn ? 'default_pfp.jpg' : null;

    let latestPosts = await getLatestPosts();
    let searchResults = [];
    let noPosts = null;

    if (search && search.trim() !== '') {
        searchResults = await getPostsContaining(search);
        noPosts = searchResults.length === 0 ? `No posts containing "${search}"` : null;
    } else {
        searchResults = null;
        noPosts = null;
        latestPosts = await getLatestPosts();
    }

    res.locals = { title: 'Dashboard', loggedIn: loggedIn };
    res.render('dashboard', { latestPosts, searchResults, noPosts, newPost, loggedIn, userForums, userChats, profilePicture, user });
}

function forumPage(req, res, _next) {
    // console.log('forumPage');
    // console.log(req.body);
    const threads = [
        {
            id: 0,
            title: 'First thread',
            createdAt: '2020-01-01',
            replyCount: 0,
        }
    ];
    res.locals = { title: 'Forum', threads };
    res.render('forum');
}

function chatPage(req, res, _next) {
    // console.log('chatPage');
    // console.log(req.body);
    const messages = [
        {
            sender: 'John Doe',
            content: '',
            timestamp: '2020-01-01',
        },
        {
            sender: 'Jane Doe',
            content: '',
            timestamp: '2020-01-01',
        }
    ];

    res.locals = { title: 'Chat', messages };
    res.render('chat');
}

function newPostPage(req, res, _next) {
    res.locals = { title: 'New Post' };
    res.render('new-post');
}

async function postPage(req, res, _next) {
    const { id } = req.params;
    // console.log(`Post ID: ${id}`);
    const posts = await getAllPosts(); // Assuming getLatestPosts returns an array of posts
    // console.log(`Posts: %o`, posts);
    const post = posts.find((post) => {
        // console.log(`Post ID: ${post.id}`);
        return post.id === parseInt(id);
    });

    if (!post) {
        // Handle the case where the post with the specified ID is not found
        return res.status(404).send("Post not found");
    }

    res.locals.title = post.title;
    res.render('post', { post });
}


async function getUserById(id) {
    // Assuming you have a database connection or an ORM configured
    // Use your preferred method to query the database and retrieve the user data
    // Adjust the query logic based on your specific database setup

    try {
        // Example using SQL query
        const conn = db.getConnection();
        const query = 'SELECT * FROM users WHERE id = ?';
        const [userRows, _] = await conn.query(query, [id]);

        if (userRows.length === 0) {
            // User with the specified ID was not found
            return null;
        }

        // Assuming the user object is present in the first row of the result
        const user = userRows[0];

        // get role_name from roles table
        const roleQuery = 'SELECT name FROM roles WHERE id = ?';
        const [roleRows] = await conn.query(roleQuery, [user.role_id]);
        user.role = roleRows[0].name;

        if (user.role === 'Diák') {
            const studentQuery = 'SELECT * FROM students WHERE user_id = ?';
            const [studentRows] = await conn.query(studentQuery, [id]);

            // console.log(`Student rows: %o`, studentRows);

            if (studentRows.length > 0) {
                user.major = studentRows[0].major;
                user.year = studentRows[0].year;

            }
        } else if (user.role === 'Tanár') {
            const teacherQuery = 'SELECT * FROM teachers WHERE user_id = ?';
            const [teacherRows] = await conn.query(teacherQuery, [id]);

            // console.log(`Teacher rows: %o`, teacherRows);

            if (teacherRows.length > 0) {
                user.department = teacherRows[0].department;
            }
        } else if (user.role === 'Adminisztrátor') {
            const adminQuery = 'SELECT * FROM administrators WHERE user_id = ?';
            const [adminRows] = await conn.query(adminQuery, [id]);

            // console.log(`Admin rows: %o`, adminRows);

            if (adminRows.length > 0) {
                user.sections = adminRows[0].section;
            }

        } else if (user.role === 'Munkatárs') {
            const parentQuery = 'SELECT * FROM employees WHERE user_id = ?';
            const [emplyeeRows] = await conn.query(parentQuery, [id]);

            // console.log(`Employee rows: %o`, emplyeeRows);

            if (emplyeeRows.length > 0) {
                user.position = emplyeeRows[0].position;
            }
        }

        // console.log(`User: %o`, user);

        return user;
    } catch (error) {
        // Handle any errors that occur during the database query
        console.error('Error retrieving user from database:', error);
        throw error;
    }
}

async function profilePage(req, res, _next) {
    const isLoggedIn = !!req.cookies.token;

    if (!isLoggedIn) {
        // Handle the case where the user is not logged in
        return res.status(401).send("Unauthorized");
    }

    const userByToken = await UserModel.getUserByToken(req.cookies.token);
    const userID = userByToken.id;
    // console.log(userID);

    /* const userId = isLoggedIn.id; // Assuming the user ID is available in the loggedIn object
    const user = await getUserById(userId); // Assuming getUserById retrieves user data based on the ID */

    const user = await getUserById(userID);

    // console.log(`User: %o`, user);

    if (!user) {
        // Handle the case where the user is not found
        return res.status(404).send("User not found");
    }

    const editMode = req.query.edit === 'true';

    res.locals.title = 'Profile';
    res.render('profile', { user, editMode });
}

function newChat(req, res, _next) {
    res.locals = { title: 'New Chat' };
    res.render('new-chat');
}

function threadPage(req, res, _next) {
    // Assuming you have a database or data source to fetch the thread details and replies based on the `: id` parameter
    const threadId = req.params.id;

    // Fetch thread details from the database
    const thread = {
        id: threadId,
        title: "Thread Title",
        author: "Thread Author",
        createdAt: "Thread Date",
        content: "Thread content goes here.",
    };

    // Fetch replies for the thread from the database
    const replies = [
        {
            id: 1,
            author: "Reply Author 1",
            createdAt: "Reply Date 1",
            content: "Reply content 1",
        },
        {
            id: 2,
            author: "Reply Author 2",
            createdAt: "Reply Date 2",
            content: "Reply content 2",
        },
        // Add more replies as needed
    ];

    // Render the thread.ejs view and pass the thread and replies as variables
    res.render("thread", { thread, replies });
}

// async function editDescription(req, res, next) {
//     try {
//         // const { description } = req.body;
//         // const user = await UserModel.getUserByToken(req.cookies.token);
//         // const userID = user.id;

//         // const conn = db.getConnection();
//         // const query = 'UPDATE users SET description = ? WHERE id = ?';
//         // await conn.query(query, [description, userID]);
//         // // conn.release();

//         // res.redirect('/profile/editDescription');

//     } catch (error) {
//         next(error);
//     }
// }

// async function editDescriptionPost(req, res, next) {
//     try {
//         const user = await UserModel.getUserByToken(req.cookies.token);
//         const userID = user.id;

//         const conn = db.getConnection();
//         const query = 'SELECT description FROM users WHERE id = ?';
//         const [rows] = await conn.query(query, [userID]);
//         // conn.release();

//         res.render('edit-description', { description: rows[0].description });
//     } catch (error) {
//         next(error);
//     }
// }

// async function deleteDescription(req, res, next) {
//     try {
//         const user = await UserModel.getUserByToken(req.cookies.token);
//         const userID = user.id;

//         const conn = db.getConnection();
//         const query = 'UPDATE users SET description = ? WHERE id = ?';
//         await conn.query(query, [null, userID]);
//         // conn.release();

//         res.redirect('/profile');
//     } catch (error) {
//         next(error);
//     }
// }

// async function uploadProfilePic(req, res, next) {
//     try {
//         const user = await UserModel.getUserByToken(req.cookies.token);
//         const userID = user.id;

//         const conn = db.getConnection();
//         const query = 'UPDATE users SET profile_pic = ? WHERE id = ?';
//         await conn.query(query, [req.file.filename, userID]);
//         // conn.release();

//         res.redirect('/profile');
//     } catch (error) {
//         next(error);
//     }
// }

async function editProfilePage(req, res, _next) {
    const isLoggedIn = !!req.cookies.token;

    if (!isLoggedIn) {
        // Handle the case where the user is not logged in
        return res.status(401).send("Unauthorized");
    }
    try {
        const userByToken = await UserModel.getUserByToken(req.cookies.token);
        const userID = userByToken.id;

        // Update the user object with the latest data
        const user = await getUserById(userID);

        res.locals = { title: 'Edit Profile', user };
        res.render('edit-profile');
    } catch (error) {
        _next(error);
    }
}

async function updateProfile(req, res, next) {
    try {
        console.log("updateProfile");
        console.log(req.body);
        const { name, username, email, description, profile_pic, delete_profile_pic } = req.body;
        const user = await UserModel.getUserByToken(req.cookies.token);
        const userID = user.id;

        const conn = db.getConnection();
        let query;
        let params;

        if (delete_profile_pic) {
            // Delete the profile picture
            query = 'UPDATE users SET name = ?, username = ?, email = ?, profile_pic = NULL, description = ? WHERE id = ?';
            params = [name || user.name, username || user.username, email || user.email, description || user.description, userID];
        } else {
            // Update the profile with the new data
            query = 'UPDATE users SET name = ?, username = ?, email = ?, profile_pic = ?, description = ? WHERE id = ?';
            params = [name || user.name, username || user.username, email || user.email, profile_pic || user.profile_pic, description || user.description, userID];
        }

        await conn.query(query, params);

        // Get the updated user data
        const updatedUser = await getUserById(userID);

        // Pass the updated user data to the template
        res.locals = { title: 'Edit Profile', user: updatedUser };
        res.redirect('/profile');
    } catch (error) {
        next(error);
    }
}

export default {
    dashboardPage,
    newPost,
    newPostPage,
    postPage,
    profilePage,
    getUserForums,
    getUserChats,
    newChat,
    forumPage,
    chatPage,
    threadPage,
    getLatestPosts,
    // deleteDescription,
    // editDescription,
    // editDescriptionPost,
    editProfilePage,
    updateProfile

}
