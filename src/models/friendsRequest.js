import mongoose from "mongoose";

const FriendRequestSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: Number, enum: [1, 2, 3], default: 1 }//'pending-1', 'accepted-2', 'rejected-3'

}, { timestamps: true });

const friendRequestModel = mongoose.model("friendRequest", FriendRequestSchema);

export default friendRequestModel;
