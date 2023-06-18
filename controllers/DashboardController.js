function getLatestPosts() {
    return [
        {
            writer_name: 'John Doe',
            writer_profile_pic: 'https://www.w3schools.com/howto/img_avatar.png',
            created_at: '2020-01-01',
            title: 'First post',
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam aliquet, ante non ultricies convallis, nisl nisi aliquam velit, nec cursus nisi felis nec nibh. Donec et nisl non nisl facilisis lacinia. Sed vitae erat quis quam aliquam ullamcorper. Nulla facilisi. Donec sit amet semper nisl. Sed euismod, augue eget lacinia vestibulum, est tortor aliquam leo, sed aliquam magna elit vitae elit. Donec id ante non nisl aliquet ultricies. Sed euismod, augue eget lacinia vestibulum, est tortor aliquam leo, sed aliquam magna elit vitae elit. Donec id ante non nisl aliquet ultricies.',
        },

    ];
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


function dashboardPage(req, res, _next) {
    const { loggedIn } = req.body;
    const latestPosts = getLatestPosts();
    const userForums = getUserForums();
    const userChats = getUserChats();
    res.locals = { title: 'Dashboard', loggedIn: loggedIn };
    res.render('dashboard', { latestPosts, newPost, loggedIn, userForums, userChats });
}


function newPostPage(req, res, _next) {
    res.locals = { title: 'New Post' };
    res.render('new-post');
}

function postPage(req, res, _next) {
    const { id } = req.params;
    const post = getLatestPosts()[id];
    res.locals = { title: post.title };
    res.render('post', { post });
}

function profilePage(req, res, _next) {
    const user = { name: 'John Doe', username: 'Johnny', email: 'john.doe@gmail.com', profile_pic: 'https://www.w3schools.com/howto/img_avatar.png', description: '...', role: 'Diák', major: 'Programtervező informatikus', year: 'II' };
    res.locals = { title: 'Profile', loggedIn: true, user: user };
    res.render('profile');
}

export default {
    dashboardPage,
    newPost,
    newPostPage,
    postPage,
    profilePage,
    getUserForums
}