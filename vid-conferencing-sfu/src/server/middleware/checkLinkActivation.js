
const checkLinkActivation = (req, res, next) => {
    const { mentorId, date, time } = req.params; 
    const meetingDate = new Date(`${date}T${time}:00+05:30`); 
    const currentDate = new Date();

    if (currentDate < meetingDate) {
        return res.status(403).json({ message: "This link is not active now" });
    }
   
    next();
};

export default checkLinkActivation;