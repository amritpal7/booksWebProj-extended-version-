const express = require("express");
const fs = require("fs");

const sellers = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/sellers.json`)
);

exports.getSellers = (req, res, next) => {
  res.status(200).json({
    success: true,
    results: sellers.length,
    requesedtAt: req.requestTime,
    data: sellers,
  });
};

exports.getSeller = (req, res, next) => {
  const sellerId = req.params.sellerId * 1;
  const seller = sellers.find((el) => el._id === sellerId);

  if (!seller) {
    res.status(404).json({
      success: false,
      message: `Any seller with id ${sellerId} doesn't exist.`,
    });
  }
  res.status(200).json({
    success: true,
    requesedtAt: req.requestTime,
    data: { seller },
  });
};

exports.createSeller = (req, res, next) => {
  // console.log(req.body);
  const newId = sellers[sellers.length - 1]._id + 1;
  const newSeller = Object.assign({ _id: newId }, req.body);

  sellers.push(newSeller);

  fs.writeFile(
    `${__dirname}/dev-data/data/sellers.json`,
    JSON.stringify(sellers),
    (err) => {
      res.status(201).json({
        success: true,
        data: {
          seller: newSeller,
        },
      });
    }
  );
};

exports.updateSeller = (req, res, next) => {
  console.log(req.params.sellerId);
  const sellerId = req.params.sellerId * 1;

  if (sellerId > sellers.length) {
    res.status(404).json({
      success: false,
      data: {
        seller: `Any seller with id ${sellerId} doesn't exist.`,
      },
    });
  } else {
    res.status(200).json({
      success: true,
      data: {
        seller: `< seller info updated. >`,
      },
    });
  }
};

exports.deleteSeller = (req, res, next) => {
  console.log(req.params.sellerId);
  const sellerId = req.params.sellerId * 1;

  if (sellerId > sellers.length) {
    res.status(404).json({
      success: false,
      data: {
        seller: `Any seller with id ${sellerId} doesn't exist.`,
      },
    });
  } else {
    res.status(202).json({
      success: true,
      requesedtAt: req.requestTime,
      message: `< seller deleted. >`,
      data: {},
    });
  }
};