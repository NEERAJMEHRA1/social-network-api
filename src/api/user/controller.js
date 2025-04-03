//NPM
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
//Models
import userModel from "../../models/users.js";
//Response
import userResponse from "../../response/userResponse.js";
//Functions
import logger from '../../../logger.js';
import { emailExist, getUserByEmail, getUserById } from "./service.js";
import { createJwtToken, getMessage } from "../../helper/common/helpers.js";


/**
 * @Method Method used to register new user in platform
 * @author Neeraj-Mehra
 * @param {*} req 
 * @param {*} res 
 * @date 04-APRIL-2025
 */
export const userRegister = async (req, res) => {
    try {
        const { language = "en", userName, email, password, address, countryCode, phoneNumber } = req.body;

        //use validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send({
                status: false,
                message: await getMessage(language, errors.errors[0]["msg"]),
            })
        }
        //email valid regex
        let regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!regex.test(email)) {
            return res.send({
                status: false,
                message: await getMessage(language, "Invalid_Email_Address")
            });
        }

        //email convert in lower case
        const lowerEmail = email.toLowerCase();

        //function used to check email already exist or not
        const checkEmail = await emailExist(lowerEmail);
        if (checkEmail) {
            return res.send({
                status: false,
                message: await getMessage(language, "Email_Already_Exist"),
            });

        }

        const userObj = new userModel({
            userName: userName,
            email: lowerEmail,
            password: bcrypt.hashSync(password, 10),
            address: address || "",
            countryCode: countryCode || "",
            phoneNumber: phoneNumber
        });

        const userSave = await userObj.save();

        if (userSave) {
            //create jwt token
            const jwtToken = await createJwtToken({ id: userSave._id, email: lowerEmail });

            logger.info(`#####*****userRegister : user register success*****#####`);

            return res.status(200).send({
                status: true,
                token: jwtToken,
                message: await getMessage(language, "User_Register_Success"),
            })
        }

        logger.info(`#####*****userRegister : Feild to user register*****#####`);

        return res.send({
            status: false,
            message: await getMessage(language, "Feild_To_Register_User"),
        });

    } catch (error) {
        logger.error(`userRegister : Error==>> ${error.message}`)
        return res.send({
            status: false,
            message: error.message,
        })
    }
};

/**
 * @Method method used to user login by email and password
 * @param {*} req 
 * @param {*} res 
 * @date 04-APRIL-2025
 */
export const userLogin = async (req, res) => {
    try {

        const { language, email, password } = req.body;

        //valifation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).send({
                status: false,
                message: await getMessage(language, errors.error[0]['msg']),
            })
        }
        //get user by email
        const checkUser = await getUserByEmail(email.toLowerCase());
        if (!checkUser) {
            return res.status(404).send({
                status: false,
                message: await getMessage(language, "User_Does_Not_Exist"),
            })
        }

        if (bcrypt.compareSync(password, checkUser.password)) {

            //generate jwt token
            const token = await createJwtToken({ id: checkUser._id });

            logger.info(`#####*****userLogin : user login success*****#####`);

            return res.status(200).send({
                status: true,
                message: await getMessage(language, "User_Login_Success"),
                token: token,
                data: new userResponse(checkUser),
            })
        } else {
            return res.status(400).send({
                status: false,
                message: await getMessage(language, "Envalid_Email_Password")
            })
        }
    } catch (error) {

        logger.info(`userLogin : Error==>> ${error.message}`);

        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
}

/**
 * @Method Method used to get user details
 * @param {*} req 
 * @param {*} res 
 * @date 04-APRIL-2025
 */
export const getUserDetail = async (req, res) => {
    try {

        //decoded user id
        const userId = req.user.id;
        const language = req.query.language;

        //get user data by id
        const getUserData = await getUserById(userId);

        if (getUserData) {
            return res.send({
                status: true,
                message: await getMessage(language, "Get_User_Details_Success"),
                data: new userResponse(getUserData),
            })
        }

        return res.send({
            status: false,
            message: await getMessage(language, "Data_Not_Found"),
        });

    } catch (error) {
        return res.send({
            status: false,
            message: error.message
        })
    }
};
