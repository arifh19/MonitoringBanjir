const express = require('express');
const router = express.Router();
const model = require('../models/index');
const fetch = require("node-fetch")
const API_KEY = "2f67108a3beb40e38cd34224201611"
const location = "Yogyakarta"

// GET sungai listing.
router.get('/', async function (req, res, next) {
    try {
      const sungai = await model.sungai.findAll({
        limit: 1,
        order: [ [ 'createdAt', 'DESC' ]]
      });
      console.log(sungai)
      if (sungai.length !== 0) {
        res.json({
          'status': 'OK',
          'messages': '',
          'data': sungai
        })
      } else {
        res.json({
          'status': 'ERROR',
          'messages': 'EMPTY',
          'data': {}
        })
      }
    } catch (err) {
      res.json({
        'status': 'ERROR',
        'messages': err.messages,
        'data': {}
      })
    }
  });
// POST sungai
router.post('/', async function (req, res, next) {
    try {
        const {
            tinggiAir
        } = req.body;
        let response = await fetch(`http://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${location}`)
        let data = await response.json()
        console.log(data)
        let cuaca = data.current.condition.text
        const sungai = await model.sungai.create({
            tinggiAir, cuaca: cuaca
        });
        if (sungai) {
        res.status(201).json({
            'status': 'OK',
            'messages': 'Data berhasil ditambahkan',
            'data': sungai,
        })
        }
    } catch (err) {
        res.status(400).json({
            'status': 'ERROR',
            'messages': err.message,
            'data': {},
        })
    }
});
// UPDATE sungai
router.patch('/:id', function(req, res, next) {
});
// DELETE sungai
router.delete('/:id', function(req, res, next) {
});
module.exports = router;