import express from 'express'
import {
  getAll,
  signUp
} from '../controllers/usersController.js'

const router = express.Router()

router.get('/', getAll)
router.post('/', signUp)

export default router
