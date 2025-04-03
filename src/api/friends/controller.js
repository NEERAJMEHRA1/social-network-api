//NPM
import mongoose from "mongoose";
import { validationResult } from "express-validator";
//Models
import userModel from "../../models/users.js";
import friendRequestModel from "../../models/friendsRequest.js";
//Functions
import logger from '../../../logger.js';
import { getMessage } from "../../helper/common/helpers.js";
import { requestStatus } from "../../helper/common/constant.js";

/**
 * @Method Method used to send friedns request
 * @author Neeraj-Mehra
 * @param {*} req 
 * @param {*} res 
 * @date 04-APRIL-2025
 */
export const sendFriendRequest = async (req, res) => {
    try {
        const { language, receiverId } = req.body;

        //decoded send user id
        const senderId = req.user.id;

        if (senderId === receiverId) {
            return res.status(400).send({
                status: false,
                message: await getMessage(language, 'Invalid_Request')
            });
        }

        //check friends request alreay exist
        const existingRequest = await friendRequestModel.findOne({ sender: senderId, receiver: receiverId });

        if (existingRequest) {
            return res.status(400).send({
                status: false,
                message: await getMessage(language, 'Friend_Request_Already_Sent'),
            });
        };

        const friendRequest = new friendRequestModel({ sender: senderId, receiver: receiverId });
        await friendRequest.save();

        logger.info(`#####*****sendFriendRequest : Request sended successfully*****#####`);

        res.status(201).send({
            status: true,
            message: await getMessage(language, 'Friend_Request_Send_Success')
        });
    }
    catch (error) {
        logger.error(`sendFriendRequest : Error===>>> ${error}`);

        res.status(500).send({
            status: false,
            message: error.message
        });
    }

}

/**
 * @Method Method used to respond to friends request
 * @author Neeraj-Mehra
 * @param {*} req 
 * @param {*} res 
 * @date 04-APRIL-2025
 */
export const respondToFriendRequest = async (req, res) => {
    try {
        const { status } = req.body;

        const requestId = req.params.id;

        //get friend request by id
        const friendRequest = await friendRequestModel.findById(requestId);
        if (!friendRequest) {
            return res.status(404).send({
                status: false,
                message: 'Request not found'
            });
        };

        if (friendRequest.receiver.toString() !== req.user.id) {
            return res.status(403).send({
                status: false,
                message: 'Unauthorized'
            });
        };

        //update status on request model
        friendRequest.status = status;
        await friendRequest.save();

        //update status on DB
        await friendRequestModel.updateOne(
            { _id: requestId },
            {
                $set: { status: status }
            });
        if (status === requestStatus.accepted) {
            //update friend id in user table
            await userModel.findByIdAndUpdate(friendRequest.receiver, { $push: { friends: friendRequest.sender } });
        }

        let mgs = status == 1 ? "Accepted" : "Rejected";
        logger.info(`#####****respondToFriendRequest : request ${mgs} successfully*****#####`);

        return res.status(403).send({
            status: true,
            message: `Friend request ${mgs}`
        });

    } catch (error) {
        logger.error(`respondToFriendRequest : Error===>>> ${error}`);

        res.status(500).send({
            status: false,
            message: error.message
        });
    }
};

/**
 * @Method Method used to get all friends with paginations. filter ans sorting
 * @author Neeraj-Mehra
 * @param {*} req 
 * @param {*} res 
 * @date 04-APRIL-2025
 */
export const getAllFriendsWithPagination = async (req, res) => {
    try {
        let { page = 1, limit = 10, sort = "userName", order = "asc", search } = req.query;

        // Ensure page and limit are numbers
        page = parseInt(page, 10);
        limit = parseInt(limit, 10);

        // Validate page and limit
        if (page < 1 || limit < 1) {
            return res.status(400).json({ status: false, message: "Page and limit must be greater than 0" });
        }

        //decoded user id
        const userId = req.user.id;

        // Get user from token (assuming `req.user.id` is available via authentication middleware)
        const user = await userModel.findById(userId).populate("friends", "userName email phoneNumber");

        if (!user) {
            return res.status(404).send({
                status: false,
                message: "User not found"
            });
        }
        // Apply search filter if provided
        let friendsList = user.friends;

        if (search) {
            const regex = new RegExp(search, "i"); // Case-insensitive search
            friendsList = friendsList.filter(friend => regex.test(friend.userName) || regex.test(friend.email));
        }

        // Sorting
        const sortOrder = order === "desc" ? -1 : 1;
        friendsList = friendsList.sort((a, b) => (a[sort] > b[sort] ? sortOrder : -sortOrder));

        // Pagination logic
        const totalFriends = friendsList.length;
        const startIndex = (page - 1) * limit;
        const paginatedFriends = friendsList.slice(startIndex, startIndex + limit);

        logger.error(`#####*****getAllFriendsWithPagination : data fetched success*****#####`);

        return res.status(200).json({
            status: true,
            message: "Friends list retrieved successfully",
            data: paginatedFriends,
            pagination: {
                totalFriends,
                currentPage: page,
                totalPages: Math.ceil(totalFriends / limit),
                limit
            }
        });

    } catch (error) {
        logger.error(`getAllFriendsWithPagination : Error===>>> ${error.message}`);
        return res.status(500).send({
            status: false,
            message: error.message
        });
    }
};

/**
 * @Method Method used to fetch all friends
 * @author Neeraj-Mehra
 * @param {*} req 
 * @param {*} res 
 * @date 04-APRIL-2025
 */
export const getAllFriends = async (req, res) => {
    try {
        //decoded user id
        const userId = req.user.id;

        // Get user from token (assuming `req.user.id` is available via authentication middleware)
        const user = await userModel.findById(userId).populate("friends", "userName email phoneNumber");

        if (!user) {
            return res.status(404).send({
                status: false,
                message: "User not found"
            });
        };

        logger.error(`#####*****getAllFriends : all friends list fetched successfully*****#####`);

        return res.status(200).json({
            status: true,
            message: "Friends list retrieved successfully",
            data: user,
        });

    } catch (error) {
        logger.error(`getAllFriends : Error===>>> ${error.message}`);
        return res.status(500).send({
            status: false,
            message: error.message
        });
    }
};