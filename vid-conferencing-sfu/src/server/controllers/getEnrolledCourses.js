import Access from "../models/Access";
import Course from "../models/Course";
async function getEnrolledCourses(menteeId) {
    const accesses = await Access.find({ menteeId }).populate('courseId');
    return accesses.map(access => access.courseId);
}
