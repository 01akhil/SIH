import Access from "../models/Access";

async function hasAccess(menteeId, courseId) {
    const access = await Access.findOne({ menteeId, courseId });
    return access !== null;
}
