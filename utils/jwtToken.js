// Create and send token and save in cookie
const sendToken = (user, statusCode, res) => {
  const token = user.getJWTToken(); // renamed to token for consistency

  const options = {
    httpOnly: true,
    expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
  };

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      user,
      token,
    });
};

module.exports = sendToken;
