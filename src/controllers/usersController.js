import User from '../models/User.js'
import bcrypt from 'bcrypt'

export async function getAll (req, res, next) {
  const users = await User.find()
  try {
    return res.status(200).json(users)
  } catch (err) {
    next(err)
  }
}

export async function signUp (req, res, next) {
  const { name, email, password } = req.body
  const checkUser = await User.findOne({ email })
  try {
    if (checkUser) {
      // user already exists
      next(new Error('E-mail already in use.'))
    } else {
      // creation
      const hashedPassword = bcrypt.hashSync(password, 10)
      const newUser = await new User({
        name,
        email,
        password: hashedPassword,
        blogs: []
      })
      try {
        await newUser.save()
        try {
          const user = newUser.toObject()
          delete user.password
          return res.status(201).json({
            ok: true,
            message: 'User created.',
            user
          })
        } catch (err) {
          next(err)
        }
      } catch (err) {
        next(err)
      }
    }
  } catch (err) {
    next(err)
  }
}

export async function login (req, res, next) {
  const { email, password } = req.body
  const loggingUser = await User.findOne({ email })
  try {
    if (!loggingUser) {
      // user doesn't exist
      next(new Error('E-mail not registered.'))
    } else {
      // check password
      const passwordsMatch = bcrypt.compareSync(password, loggingUser.password)
      if (!passwordsMatch) {
        // passwords don't match
        next(new Error('Passwords do not match.'))
      } else {
        // login
        const user = loggingUser.toObject()
        delete user.password
        return res.status(200).json({
          ok: true,
          message: 'Succesful login.',
          user
        })
      }
    }
  } catch (err) {
    next(err)
  }
}
