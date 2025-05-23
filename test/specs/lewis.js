import { expect } from '@jest/globals'

describe('API Tests', () => {
  it('should get a post and verify it has an ID', async () => {
    const { statusCode, data } = await globalThis.apis.example.getPost(1)
    expect(statusCode).toBe(200)
    expect(data).toHaveProperty('id')
    expect(data.id).toBe(1)
  })

  it('should create a post and verify it was created', async () => {
    const postData = {
      title: 'Test Post',
      body: 'This is a test post',
      userId: 1
    }
    const { statusCode, data } =
      await globalThis.apis.example.createPost(postData)
    expect(statusCode).toBe(201)
    expect(data).toMatchObject(postData)
    expect(data).toHaveProperty('id')
  })
})
