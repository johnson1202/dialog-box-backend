const fs = require("fs");
const multer = require("multer");
const Nft = require("../../models/nft");
const Collection = require("../../models/collection");

exports.uploadNFT = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, "./public/images/nft");
    },
    filename(req, file, cb) {
      cb(null, `nft_${new Date().getTime()}.png`);
    },
  }),
  limits: {
    fileSize: 24000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.*$/)) {
      return cb(new Error("only upload image files."));
    }
    cb(undefined, true);
  },
});

exports.removeImage = (req, res) => {
  try {
    if (req.body.url !== "images/collections/collection_1648001949181.png") {
      let path = `./public/${req.body.url}`;
      fs.unlinkSync(path);
    }
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

exports.getNFTs = (req, res) => {
  const filter = {};

  if (req.query.collectionAddress) {
    filter.collection_address = req.query.collectionAddress;
  }

  Nft.find(filter).exec((err, result) => {
    if (err) {
      res.json({ success: false, message: err.message });
    } else {
      res.json({ success: true, result: result });
    }
  });
};

exports.saveNFT = (req, res) => {
  const {
    metadata_id,
    token_id,
    collection_address,
    metadata,
    created_at,
    royalty_fraction,
  } = req.body;
  const new_NFT = new Nft({
    metadata_id: metadata_id,
    token_id: token_id,
    collection_address: collection_address,
    metadata: metadata,
    royalty_fraction: royalty_fraction,
    created_at: created_at,
  });

  new_NFT.save(function (err, result) {
    if (err) {
      res.json({ success: false, message: err.message });
    } else {
      res.json({ success: true, message: "NFT saved successfully!" });
    }
  });
};

exports.updateNFT = (req, res) => {
  const filter = { metadata_id: req.body.metadata_id };
  const updates = { token_id: req.body.token_id };
  Nft.findOneAndUpdate(filter, updates, (err, result) => {
    if (err) {
      res.status(500).send(false);
    }
    res.status(200).send(true);
  });
};

exports.updateNFTByEvent = (token_id, buyer) => {
  const filter = { idForSale: token_id };
  const updates = { owner: buyer.toUpperCase(), onSale: false };
  Nft.findOneAndUpdate(filter, updates, (result) => {
    console.log("A NFT is updated successfully!");
  });
};

exports.totalCount = async () => {
  try {
    return await Nft.count();
  } catch (error) {
    console.log(error);
  }
};

exports.tokenURI = (req, res) => {
  filter = {
    token_id: req.params.token_id,
    collection_address: req.params.collection_address,
  };

  if (req.params.collection_address == "undefined") {
    res.json({
      image: SERVER_URL + "images/nft/undefined_nft.png",
      name: "unknown",
      description: "unknown",
      attributes: {},
    });
  } else {
    Nft.findOne(filter).exec((err, result) => {
      if (err) {
        res.json(err.message);
      }

      if (result) {
        let metadata = JSON.parse(result.metadata);
        metadata.image = SERVER_URL + metadata.image;
        res.json(metadata);
      } else {
        res.sendStatus(404);
      }
    });
  }
};
