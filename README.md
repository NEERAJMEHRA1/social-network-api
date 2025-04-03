# social-network-api

// first run this and install all module
# npm i

//Create .env and paste all from envFile into .env

// after that start server
# node index.js

//open swagger using it's link
# http://localhost:3000/social-apis/#/

// users api's list

# http://localhost:3000/users/userRegister (API used for register user)

# http://localhost:3000/users/userLogin (API used for login user)

# http://localhost:3000/users/getUserDetail (API used for get user details by id)

//friends api's list
# http://localhost:3000/friends/sendFriendRequest (API used for send friend request to other user)

# http://localhost:3000/friends/respondToFriendRequest/{id} (API used for respond on received friends request like (accept or reject))

# http://localhost:3000/friends/getAllFriendsWithPagination (API used for get all friedns list with pagination, search filter and sorting)

# http://localhost:3000/friends/getAllFriends (API used for get all friedns list )
