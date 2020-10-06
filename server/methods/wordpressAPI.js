/**
 *  WORDPRESS API WRAPPERS
 * 
 * reviewed: 10-5-2020
 * reviewer: wraith
 */

const axios = require('axios');
const querystring = require('querystring');
const util = require('../utils');

//BASE URI FOR ALL API CALLS
const baseURL = `${process.env.wordpressUri}/wp-json/wp/v2`;

/**
 * @name getBlogPosts
 * @function
 * @description returns blog post that matches provided params
 * @param {Object} params 
 */
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

/**
 * @name getBlogPost
 * @function
 * @description returns blog post that matches id
 * @param {string} id 
 */
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

/**
 * @name getPostByAuthor
 * @function
 * @description returns blog posts by provided author id
 * @param {string} authorId 
 */
function getPostByAuthor(authorId) {
    return getBlogPosts([{ 'author': authorId }]);
}

/**
 * @name getPostsByCategory
 * @function
 * @description return blog posts by provided category id
 * @param {string} categoryId 
 */
function getPostsByCategory(categoryId) {
    return getBlogPosts([{
        'categories': categoryId
    }]);
}

/**
 * @name getAuthors
 * @function
 * @description returns authors info
 */
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

/**
 * @name getAuthor
 * @function
 * @description returns author info of provided author id
 * @param {string} authorId 
 */
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

/**
 * @name getCategories
 * @function
 * @description returns categories info
 */
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

/**
 * @name getMedia
 * @function
 * @description returns media object info for provided media id
 * @param {string} id 
 */
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