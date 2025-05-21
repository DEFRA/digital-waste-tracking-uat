import { BaseAPI } from './base-api.js'

/**
 * @typedef {Object} Post
 * @property {string} title - Post title
 * @property {string} body - Post content
 * @property {number} userId - ID of the user who created the post
 * @property {number} [id] - Post ID
 */

/**
 * @typedef {Object} ApiResponse
 * @property {number} statusCode - HTTP status code
 * @property {Post|Post[]} data - Response data
 */

/**
 * Example API implementation using JSONPlaceholder
 */
export class ExampleAPI extends BaseAPI {
  constructor() {
    super('https://jsonplaceholder.typicode.com')
  }

  /**
   * Get a post by ID
   * @param {number} postId - Post ID
   * @returns {Promise<ApiResponse>}
   */
  async getPost(postId) {
    const { statusCode, body } = await this.get(`/posts/${postId}`)
    return { statusCode, data: await body.json() }
  }

  /**
   * Create a new post
   * @param {Post} postData - Post data
   * @returns {Promise<ApiResponse>}
   */
  async createPost(postData) {
    const { statusCode, body } = await this.post('/posts', postData)
    return { statusCode, data: await body.json() }
  }
}
