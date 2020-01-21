const util = require('../utils');
const wpApi = require('../methods/wordpressAPI');
const router = require('express').Router();

router.post('/blogs', (req, res) => {

    let request = req.body;

    const path = 'blog/blogs';

    switch (request.action) {

        case 'getBlogPosts':
            wpApi.getBlogPosts(request.params).then(
                data => {
                    res.status(200).send(util.returnMessaging(path, 'Returning blogs', null, data));
                },
                err => {
                    util.errLogger(path, err, 'getBlogPosts');
                    res.status(500).send(util.returnMessaging(path, 'Invalid request', err, null));
                }
            )
            break;
        case 'getBlogPost':
            wpApi.getBlogPost(request.params).then(
                data => {
                    res.status(200).send(util.returnMessaging(path, 'Returning blog', null, data));
                },
                err => {
                    util.errLogger(path, err, 'getBlogPost');
                    res.status(500).send(util.returnMessaging(path, 'Invalid request', err, null));
                }
            )
            break;
        case 'getPostByAuthor':
            wpApi.getPostByAuthor(request.params).then(
                data => {
                    res.status(200).send(util.returnMessaging(path, 'Returning blogs', null, data));
                },
                err => {
                    util.errLogger(path, err, 'getPostByAuthor');
                    res.status(500).send(util.returnMessaging(path, 'Invalid request', err, null));
                }
            )
            break;
        case 'getPostsByCategory':
            wpApi.getPostsByCategory(request.params).then(
                data => {
                    res.status(200).send(util.returnMessaging(path, 'Returning categories', null, data));
                },
                err => {
                    util.errLogger(path, err, 'getPostsByCategory');
                    res.status(500).send(util.returnMessaging(path, 'Invalid request', err, null));
                }
            )
            break;
        case 'getAuthors':
            wpApi.getAuthors().then(
                data => {
                    res.status(200).send(util.returnMessaging(path, 'Returning authors', null, data));
                },
                err => {
                    util.errLogger(path, err, 'getAuthors');
                    res.status(500).send(util.returnMessaging(path, 'Invalid request', err, null));
                }
            )
            break;
        case 'getAuthor':
            wpApi.getAuthor(request.params).then(
                data => {
                    res.status(200).send(util.returnMessaging(path, 'Returning author', null, data));
                },
                err => {
                    util.errLogger(path, err, 'getAuthor');
                    res.status(500).send(util.returnMessaging(path, 'Invalid request', err, null));
                }
            )
            break;
        case 'getCategories':
            wpApi.getCategories().then(
                data => {
                    res.status(200).send(util.returnMessaging(path, 'Returning categories', null, data));
                },
                err => {
                    util.errLogger(path, err, 'getCategories');
                    res.status(500).send(util.returnMessaging(path, 'Invalid request', err, null));
                }
            )
            break;
        case 'getMedia':
            wpApi.getMedia(request.params).then(
                data => {
                    res.status(200).send(util.returnMessaging(path, 'Returning media', null, data));
                },
                err => {
                    util.errLogger(path, err, 'getMedia');
                    res.status(500).send(util.returnMessaging(path, 'Invalid request', err, null));
                }
            )
            break;
        default:
            util.errLogger(path, request.action, 'Invalid Request');
            res.status(500).send(util.returnMessaging(path, 'Invalid request', null, null));
    }


});

module.exports = router;