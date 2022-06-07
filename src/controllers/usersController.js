import User from '../models/User.js'

export async function getAll (req, res, next) {
  const users = await User.find()
  try {
    res.status(200).json(users)
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
      const newUser = await new User({
        name,
        email,
        password
      })
      try {
        await newUser.save()
        try {
          res.status(201).json('User created')
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
