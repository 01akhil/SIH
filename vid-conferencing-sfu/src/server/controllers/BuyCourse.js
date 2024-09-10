import Access from "../models/Access";

async function grantCourseAccess(menteeId, courseId) {
    const access = new Access({
        menteeId,
        courseId
    });
    await access.save();
}
