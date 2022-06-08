import mongoose from 'mongoose'
import Blog from '../models/Blog.js'
import User from '../models/User.js'

export async function getAll (req, res, next) {
  const blogs = await Blog.find()
  try {
    return res.status(200).json(blogs)
  } catch (err) {
    next(err)
  }
}

export async function create (req, res, next) {
  const { title, description, image, user } = req.body
  const userCreatingBlog = await User.findById(user)
  try {
    const newBlog = await new Blog({
      title,
      description,
      image,
      user
    })
    try {
      const session = await mongoose.startSession()
      session.startTransaction()
      await newBlog.save({ session })
      userCreatingBlog.blogs.push(newBlog)
      await userCreatingBlog.save({ session })
      await session.commitTransaction()
      try {
        return res.status(201).json({ message: 'Blog created.' })
      } catch (err) {
        next(err)
      }
    } catch (err) {
      next(err)
    }
  } catch (err) {
    next(err)
  }
}

export async function update (req, res, next) {
  const { id } = req.params
  const { title, description, image } = req.body
  await Blog.findByIdAndUpdate(id, {
    title,
    description,
    image
  })
  try {
    return res.status(200).json({ message: 'Blog updated.' })
  } catch (err) {
    next(err)
  }
}

export async function getOne (req, res, next) {
  const { id } = req.params
  const oneBlog = await Blog.findById(id)
  try {
    return res.status(200).json(oneBlog)
  } catch (err) {
    next(err)
  }
}

export async function deleteOne (req, res, next) {
  const { id } = req.params
  const blogToDelete = await Blog.findByIdAndRemove(id).populate('user')
  try {
    await blogToDelete.user.blogs.pull(blogToDelete)
    await blogToDelete.user.save()
    try {
      return res.status(200).json({ message: 'Blog deleted.' })
    } catch (err) {
      next(err)
    }
  } catch (err) {
    next(err)
  }
}

export async function getByUserId (req, res, next) {
  const { id } = req.params
  const userBlogs = await User.findById(id).populate('blogs')
  try {
    return res.status(200).json(userBlogs)
  } catch (err) {
    next(err)
  }
}
