const axios = require('axios');
const querystring = require('querystring');
const util = require('../utils');

const baseURL = `${process.env.wordpressUri}/wp-json/wp/v2`;

function getBlogPosts(params) {
    let paramString = '';
    if (params) {
        params.forEach((element, index) => {
            let key = Object.keys(element);
            if (index == 0) {
                paramString += '?' + key[0] + '=' + element[key[0]];
            } else {
                paramString += '&' + key[0] + '=' + element[key[0]];
            }

        });
    }
    return axios.get(`${baseURL}/posts${paramString}`).then(
        res => {
            let totalBlogs = res.headers['x-wp-total'];
            let pages = res.headers['x-wp-totalpages'];
            let posts = res.data;
            return {
                totalBlogs,
                pages,
                posts
            };
        },
        err => {
            throw err;
        }
    );
}

function getBlogPost(id) {
    return axios.get(`${baseURL}/posts/${id}`).then(
        res => {
            return res.data
        },
        err => {
            throw err;
        }
    )
}

function getPostByAuthor(authorId) {
    return getBlogPosts([{ 'author': authorId }]);
}

// getPostByAuthor(17);

function getPostsByCategory(categoryId) {
    return getBlogPosts([{
        'categories': categoryId
    }]);
}

// getPostsByCategory(1);

function getAuthors() {
    return axios.get(`${baseURL}/users?per_page=100`).then(
        res => {
            return res.data;
        },
        err => {
            throw err;
        }
    )
}

// getAuthors();
function getAuthor(authorId) {
    return axios.get(`${baseURL}/users/${authorId}`).then(
        res => {
            return res.data;
        },
        err => {
            throw err;
        }
    )
}

function getCategories() {
    return axios.get(`${baseURL}/categories?per_page=100`).then(
        res => {
            return res.data;
        },
        err => {
            throw err;
        }
    )
}

function getMedia(id) {
    return axios.get(`${baseURL}/media/${id}`).then(
        res => {
            return res.data;
        },
        err => {
            throw err;
        }
    );
}

module.exports = {
    getAuthor,
    getAuthors,
    getBlogPost,
    getBlogPosts,
    getPostByAuthor,
    getPostsByCategory,
    getCategories,
    getMedia
}