import UsersModel from "../models/usersModel.js";
import bcrypt from "bcrypt";

// get a user
export const getUser = async (req, res) => {
  const id = req.params.id;

  // const user = await UsersModel.findById(id)
  //   .then((req, res) => res.status(200).json(user))
  //   .catch((err) => res.status(500).json(err));

  try {
    const user = await UsersModel.findById(id);
    if (user) {
      const { password, ...otherDetails } = user._doc;
      console.log(otherDetails);
      res.status(200).json(otherDetails);
    } else {
      res.status(404).json("No such user exist");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

// update user
export const updateUser = async (req, res) => {
  const id = req.params.id;
  const { currentUserId, currentUserAdminStatus, password } = req.body;

  if (id === currentUserId || currentUserAdminStatus) {
    try {
      console.log(password);
      if (password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(password, salt);
      }
      console.log(req.body);
      const user = await UsersModel.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(403).json("Access Denied! you can only update your own profile");
  }
};

// delete user
export const deleteUser = async (req, res) => {
  const id = req.params.id;
  const { currentUserId, currentUserAdminStatus } = req.body;

  if (id === currentUserId || currentUserAdminStatus) {
    try {
      console.log(id);
      await UsersModel.findByIdAndDelete(id);
      res.status(200).json("user deleted successfully");
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(403).json("Access Denied! you can only delete your own profile");
  }
};

// follow a user
export const followUser = async (req, res) => {
  const id = req.params.id;
  const { _id } = req.body;
  console.log(id, _id);
  if (_id === id) {
    res.status(403).json("Action Forbidden");
  } else {
    try {
      const followUser = await UsersModel.findById(id);
      const followingUser = await UsersModel.findById(_id);

      if (!followUser.followers.includes(_id)) {
        await followUser.updateOne({ $push: { followers: _id } });
        await followingUser.updateOne({ $push: { following: id } });
        res.status(200).json("User followed!");
      } else {
        res.status(403).json("You are already following this user");
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  }
};

// unfollow a user
export const unfollowUser = async (req, res) => {
  const id = req.params.id;
  const { _id } = req.body;

  console.log(id, _id);
  if (_id === id) {
    res.status(403).json("Action Forbidden");
  } else {
    try {
      const unFollowUser = await UsersModel.findById(id);
      const unFollowingUser = await UsersModel.findById(_id);

      if (unFollowUser.followers.includes(_id)) {
        await unFollowUser.updateOne({ $pull: { followers: _id } });
        await unFollowingUser.updateOne({ $pull: { following: id } });
        res.status(200).json("User unfollowed!");
      } else {
        res.status(403).json("You are not following this User");
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  }
};
