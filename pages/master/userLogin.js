const router = require("express").Router();
const { User } = require("../../modals/User");
const moment = require("moment");
const momentTime = require("moment-timezone");
const { Setting } = require("../../modals/setting");

const currentTime = Number(momentTime().tz("asia/kolkata").format("HH:mm ").split(':').join(''))


const userLogin = async (req, res) => {
  const data = req.body;
  const errors = {};
  let currVersion = await Setting.findOne({})

  console.log(currVersion, "===========", data.version);
  if(currVersion.version != data.version)
  {
    console.log('inside -----')
    return res.json({ loginSuccess: false, message: "Please upgrade to latest version" })
  }

  if (!data.email || !data.password || data.email === "") {
    errors["inputError"] = "Fields not provided";
  }
  
  User.findOne({ email: req.body.email }, (err, user) => 
  {

    if (!user || user.active_status ==="N") {
      return res.json({
        loginSuccess: false,
        message: "Auth failed, email not found",
      });
    }
    // //new with mode and time check
    user.comparePassword(req.body.password, (err, isMatch) => {

      if (!isMatch)
        return res.json({ loginSuccess: false, message: "Wrong password" });

      user.weekDays.find(e => (e.ddl_weekDays_id === new Date().getDay())) ?
        user.weekDays.map((a, i) => {
          if (a.ddl_weekDays_id === new Date().getDay()) {
            // current time < start time
            // curent time > end time

            console.log("reachedw", data.mode,currentTime , a.txt_Start_time,a.txt_End_time,currentTime >= a.txt_Start_time,currentTime <= a.txt_End_time)

            if (
              data.mode === "Web" && a.web_status === true
              &&
              currentTime >= a.txt_Start_time
              // moment(new Date(),"HH:MM").unix() > moment(a.txt_Start_time, 'HH:mm').unix()
              &&
              currentTime <= a.txt_End_time
              // moment(new Date(),"HH:MM").unix() < moment(a.txt_End_time, 'HH:mm').unix()
            ) {

              console.log("reached here")
              user.generateToken((err, user) => {
                if (err) return res.status(400).send(err);
                res.cookie("w_authExp", user.tokenExp);
                res.status(200).json({
                  loginSuccess: true,
                  userId: user._id,
                  userToken: user.token,
                  user_id: user.user_id,
                });
              });
            } 
            else if (
              data.mode === "Mobile" && a.app_status === true 
              &&
              currentTime >= a.txt_Start_time
              // moment(new Date(),"HH:MM").unix() > moment(a.txt_Start_time, 'HH:mm').unix()
              &&
              currentTime <= a.txt_End_time
            )
            {
              user.generateToken((err, user) => {
                if (err) return res.status(400).send(err);
                res.cookie("w_authExp", user.tokenExp);
                res.status(200).json({
                  loginSuccess: true,
                  userId: user._id,
                  userToken: user.token,
                  user_id: user.user_id,
                });
              });
            } 
            else {
              return res.json({ loginSuccess: false, message: "Access Not Granted" });
            }
          }
        })
        :
        res.json({ loginSuccess: false, message: "Access Not Granted" })

    });

    
    // //old///

    // user.comparePassword(req.body.password, (err, isMatch) => {
    //   if (!isMatch)
    //     return res.json({ loginSuccess: false, message: "Wrong password" });

    //   user.generateToken((err, user) => {
      
    //     if (err) return res.status(400).send(err);
    //     res.cookie("w_authExp", user.tokenExp);
    //     res.status(200).json({
    //       loginSuccess: true,
    //       userId: user._id,
    //       userToken: user.token,
    //     });

    //     console.log("====>>>generateToken/status",res)

    //   });
    // });
  });
};

module.exports = userLogin;
