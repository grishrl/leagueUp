const util = require('../utils');
const wpApi = require('../methods/wordpressAPI');
const router = require('express').Router();
const {
    commonResponseHandler
} = require('./../commonResponseHandler');

router.post('/blogs', (req, res) => {

    commonResponseHandler(req, res, [], [], async(req, res) => {
        const response = {};
        let request = req.body;

        const path = 'blog/blogs';

        switch (request.action) {

            case 'getBlogPosts':
                return wpApi.getBlogPosts(request.params).then(
                    data => {
                        response.status = 200;
                        response.message = util.returnMessaging(req.originalUrl, 'Returning blogs', null, data)
                        return response;
                    },
                    err => {
                        const e = {action:request.action, params:request.params, status:err.response.status, statusText:err.statusText, path: err.request.path};
                        util.errLogger(req.originalUrl, e, 'getBlogPosts');
                        response.status = 500;
                        response.message = util.returnMessaging(req.originalUrl, 'Invalid request', err, null);
                        return response;
                    }
                )
                break;
            case 'getBlogPost':
                return wpApi.getBlogPost(request.params).then(
                    data => {
                        response.status = 200;
                        response.message = util.returnMessaging(req.originalUrl, 'Returning blog', null, data)
                        return response;
                    },
                    err => {
                        const e = {
                            action: request.action,
                            params: request.params,
                            status: err.response.status,
                            statusText: err.statusText,
                            path: err.request.path,
                        };
                        util.errLogger(req.originalUrl, err, 'getBlogPost');
                        response.status = 500;
                        response.message = util.returnMessaging(req.originalUrl, 'Invalid request', e, null)
                        return response;
                    }
                )
                break;
            case 'getPostByAuthor':
                return wpApi.getPostByAuthor(request.params).then(
                    data => {
                        response.status = 200;
                        response.message = util.returnMessaging(req.originalUrl, 'Returning blogs', null, data)
                        return response;
                    },
                    err => {
                        const e = {
                            action: request.action,
                            params: request.params,
                            status: err.response.status,
                            statusText: err.statusText,
                            path: err.request.path,
                        };
                        util.returnMessaging(req.originalUrl, 'Invalid request', e, null)
                        response.status = 500
                        response.message = util.returnMessaging(req.originalUrl, 'Invalid request', e, null)
                        return response;
                    }
                )
                break;
            case 'getPostsByCategory':
                return wpApi.getPostsByCategory(request.params).then(
                    data => {
                        response.status = 200;
                        response.message = util.returnMessaging(req.originalUrl, 'Returning categories', null, data)
                        return response;
                    },
                    err => {
                        util.errLogger(req.originalUrl, err, 'getPostsByCategory');
                        response.status = 500;
                        response.message = util.returnMessaging(req.originalUrl, 'Invalid request', err, null)
                        return response;
                    }
                )
                break;
            case 'getAuthors':
                return wpApi.getAuthors().then(
                    data => {
                        response.status = 200;
                        response.message = util.returnMessaging(req.originalUrl, 'Returning authors', null, data)
                        return response;
                    },
                    err => {
                        const e = {
                            action: request.action,
                            params: request.params,
                            status: err.response.status,
                            statusText: err.statusText,
                            path: err.request.path,
                        };
                        util.errLogger(req.originalUrl, e, 'getAuthors');
                        response.status = 500;
                        response.message = util.returnMessaging(req.originalUrl, 'Invalid request', e, null)
                        return response;
                    }
                )
                break;
            case 'getAuthor':
                return wpApi.getAuthor(request.params).then(
                    data => {
                        response.status = 200;
                        response.message = util.returnMessaging(req.originalUrl, 'Returning author', null, data)
                        return response;
                    },
                    err => {
                        const e = {
                            action: request.action,
                            params: request.params,
                            status: err.response.status,
                            statusText: err.statusText,
                            path: err.request.path,
                        };
                        util.errLogger(req.originalUrl, e, 'getAuthor');
                        response.status = 500;
                        response.message = util.returnMessaging(req.originalUrl, 'Invalid request', e, null);
                        return response;
                    }
                )
                break;
            case 'getCategories':
                return wpApi.getCategories().then(
                    data => {
                        response.status = 200;
                        response.message = util.returnMessaging(req.originalUrl, 'Returning categories', null, data)
                        return response;
                    },
                    err => {
                        const e = {
                            action: request.action,
                            params: request.params,
                            status: err.response.status,
                            statusText: err.statusText,
                            path: err.request.path,
                        };
                        util.errLogger(req.originalUrl, e, 'getCategories');
                        response.status = 200;
                        response.message = util.returnMessaging(req.originalUrl, 'Invalid request', e, null)
                        return response;
                    }
                )
                break;
            case 'getMedia':
                return wpApi.getMedia(request.params).then(
                    data => {
                        response.status = 200;
                        response.message = util.returnMessaging(req.originalUrl, 'Returning media', null, data);
                        return response;
                    },
                    err => {
                        const e = {
                            action: request.action,
                            params: request.params,
                            status: err.response.status,
                            statusText: err.statusText,
                            path: err.request.path,
                        };
                        util.errLogger(req.originalUrl, e, 'getMedia');
                        response.status = 500;
                        response.message = util.returnMessaging(req.originalUrl, 'Invalid request', e, null);
                        return response;
                    }
                )
                break;
            default:
                util.errLogger(req.originalUrl, request.action, 'Invalid Request');
                response.status = 500
                response.message = util.returnMessaging(
                    req.originalUrl,
                    'Invalid request',
                    null,
                    null
                );
                return response;
        }
    })

});

module.exports = router;