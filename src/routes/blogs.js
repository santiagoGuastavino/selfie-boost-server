import express from 'express'
import {
  getAll,
  create,
  update,
  getOne,
  deleteOne,
  getByUserId
} from '../controllers/blogsController.js'

const router = express.Router()

router.get('/', getAll)
router.post('/', create)
router.put('/:id', update)
router.get('/:id', getOne)
router.delete('/:id', deleteOne)
router.get('/user/:id', getByUserId)

export default router
