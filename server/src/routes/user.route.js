import express from "express";
import { body } from "express-validator";
import favoriteController from "../controllers/favorite.controllers.js";
import userController from "../controllers/user.controller.js";
import requestHandler from "../handlers/request.handler.js";
import userModel from "../models/user.model.js";
import tokenMiddleware from "../middlewares/token.middleware.js";

const router = express.Router();

router.get("/people", userController.getPeople);

router.post(
  "/signup",
  body("username")
    .exists()
    .withMessage("username is required")
    .isLength({ min: 8 })
    .withMessage("username minimum 8 characters")
    .custom(async (value) => {
      const user = await userModel.findOne({ username: value });
      if (user) return Promise.reject("username already used");
    }),
  body("password")
    .exists()
    .withMessage("password is required")
    .isLength({ min: 8 })
    .withMessage("password minimum 8 characters"),
  body("confirmPassword")
    .exists()
    .withMessage("confirmPassword is required")
    .isLength({ min: 8 })
    .withMessage("confirmPassword minimum 8 characters")
    .custom((value, { req }) => {
      if (value !== req.body.password)
        throw new Error("confirmPassword not match");
      return true;
    }),
  body("displayName")
    .exists()
    .withMessage("displayName is required")
    .isLength({ min: 8 })
    .withMessage("displayName minimum 8 characters"),
  requestHandler.validate,
  userController.signup
);

router.post(
  "/signin",
  body("username")
    .exists()
    .withMessage("username is required")
    .isLength({ min: 8 })
    .withMessage("username minimum 8 characters"),
  body("password")
    .exists()
    .withMessage("password is required")
    .isLength({ min: 8 })
    .withMessage("password minimum 8 characters"),
  requestHandler.validate,
  userController.signin
);

router.put(
  "/update-password",
  tokenMiddleware.auth,
  body("password")
    .exists()
    .withMessage("password is required")
    .isLength({ min: 8 })
    .withMessage("password minimum 8 characters"),
  body("newPassword")
    .exists()
    .withMessage("newPassword is required")
    .isLength({ min: 8 })
    .withMessage("newPassword minimum 8 characters"),
  body("confirmNewPassword")
    .exists()
    .withMessage("confirmNewPassword is required")
    .isLength({ min: 8 })
    .withMessage("confirmNewPassword minimum 8 characters")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword)
        throw new Error("confirmNewPassword not match");
      return true;
    }),
  requestHandler.validate,
  userController.updatePassword
);

router.get("/info", tokenMiddleware.auth, userController.getInfo);

router.get(
  "/favorites",
  tokenMiddleware.auth,
  favoriteController.getFavoritesOfUser
);

router.post('/getuser', userController.getUser);

router.post(
  "/favorites",
  tokenMiddleware.auth,
  body("mediaType")
    .exists()
    .withMessage("mediaType is required")
    .custom((type) => ["movie", "tv"].includes(type))
    .withMessage("mediaType invalid"),
  body("mediaId")
    .exists()
    .withMessage("mediaId is required")
    .isLength({ min: 1 })
    .withMessage("mediaId can not be empty"),
  body("mediaTitle").exists().withMessage("mediaTitle is required"),
  body("mediaPoster").exists().withMessage("mediaPoster is required"),
  body("mediaRate").exists().withMessage("mediaRate is required"),
  requestHandler.validate,
  favoriteController.addFavorite
);

router.delete(
  "/favorites/:favoriteId",
  tokenMiddleware.auth,
  favoriteController.removeFavorite
);

// send request
router.put("/request", async (req, res) => {
  let flag = false;
  try {
    const parentuser = await userModel.findById(req.body.parentId); // user sending the request
    const childuser = await userModel.findById(req.body.childId); // user to request

    for (const request of childuser.requests) {
      if (String(request._id) === String(parentuser._id)) {
        flag = true;
        break; // No need to continue checking if the request is found
      }
    }

    if (flag) {
      res.status(404).json('User has been already requested!');
      return;
    }

    await childuser.updateOne({ $push: { requests: parentuser } });

    res.status(200).json("User has been updated");
  } catch (err) {
    res.status(500).json("Failed");
  }
});

//get a user
router.post("/getdata", async (req, res) => {
  const username = req.body.username;
  try {
    const user = await userModel.findOne({ username: username });
    const { updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
});

// accept friend request
router.put("/requesthandler", async (req, res) => {
  try {
    const recievinguser = await userModel.findById(req.body.recievingId); // user sending the request
    const sendinguser = await userModel.findById(req.body.sendingId); // user to request
    const currentUser = await userModel.findById(req.body.recievingId);

    await recievinguser.updateOne({ $push: { friends: sendinguser } });
    await sendinguser.updateOne({ $push: { friends: recievinguser } });

    currentUser.requests = currentUser?.requests?.filter((item) => {
      return String(item._id) !== String(req.body.sendingId);
    });

    await currentUser.save();

    res.status(200).json("user has been updated");
  } catch (err) {
    res.status(500).json("failed");
  }
});

// decline a friend request

router.put("/request/decline", async (req, res) => {

  try {
    const currentUser = await userModel.findById(req.body.userId);
    currentUser.requests = currentUser?.requests?.filter((item) => {
      return String(item._id) !== String(req.body.senderId);
    });

    await currentUser.save();

    res.status(200).json("user has been unfollowed");
  } catch (err) {
    console.log(err);
  }
});

export default router;
